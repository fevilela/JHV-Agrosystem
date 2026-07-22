import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = {
  id?: string;
  role?: string;
  isSuperAdmin?: boolean;
  organizationId?: string | null;
};

export async function getTenantContext() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  return {
    userId: user.id as string,
    role: user.role as string,
    isSuperAdmin: Boolean(user.isSuperAdmin),
    organizationId: user.organizationId ?? null,
  };
}

export async function requireOrg() {
  const ctx = await getTenantContext();
  if (!ctx.organizationId) redirect("/admin");

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    include: { organization: true },
  });
  if (!user?.organization || !user.organization.active) redirect("/login");

  // Administradores sempre têm acesso a tudo que a organização libera;
  // os demais só têm os módulos marcados pra eles, dentro do que a
  // organização permite (nunca mais do que ela libera).
  const effectiveModules =
    user.role === "ADMIN"
      ? user.organization.allowedModules
      : user.allowedModules.filter((m) => user.organization!.allowedModules.includes(m));

  return {
    ...ctx,
    organizationId: user.organization.id,
    organization: user.organization,
    effectiveModules,
    userName: user.name,
  };
}

// Non-redirecting variant of requireOrg(), for Route Handlers (redirect()
// from next/navigation doesn't produce a usable HTTP response there).
export async function getApiOrgContext() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  });
  if (!dbUser?.organization || !dbUser.organization.active) return null;

  return {
    organizationId: dbUser.organization.id,
    userId: dbUser.id,
    userName: dbUser.name,
  };
}

export async function requireModule(moduleKey: string) {
  const ctx = await requireOrg();
  if (!ctx.effectiveModules.includes(moduleKey)) redirect("/");
  return ctx;
}

export async function requireSuperAdmin() {
  const ctx = await getTenantContext();
  if (!ctx.isSuperAdmin) redirect("/");
  return ctx;
}
