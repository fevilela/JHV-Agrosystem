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

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
  });
  if (!org || !org.active) redirect("/login");

  return { ...ctx, organizationId: ctx.organizationId, organization: org };
}

export async function requireModule(moduleKey: string) {
  const ctx = await requireOrg();
  if (!ctx.organization.allowedModules.includes(moduleKey)) redirect("/");
  return ctx;
}

export async function requireSuperAdmin() {
  const ctx = await getTenantContext();
  if (!ctx.isSuperAdmin) redirect("/");
  return ctx;
}
