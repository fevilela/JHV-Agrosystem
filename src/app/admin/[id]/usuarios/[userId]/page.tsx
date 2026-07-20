import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserForm } from "../../add-user-form";
import { updateOrgUserAction } from "../../../actions";
import { ALWAYS_ON_MODULES } from "@/lib/nav";

export default async function EditOrgUserPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = await params;

  const [user, organization] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, organizationId: id } }),
    prisma.organization.findUnique({ where: { id }, select: { allowedModules: true } }),
  ]);

  if (!user || !organization) notFound();

  const availableModules = organization.allowedModules.filter(
    (m) => !ALWAYS_ON_MODULES.includes(m)
  );

  return (
    <div>
      <Link href={`/admin/${id}`} className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Voltar
      </Link>
      <h1 className="mt-1 mb-6 text-xl font-semibold text-neutral-900">Editar Usuário</h1>

      <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-7">
        <UserForm
          action={updateOrgUserAction.bind(null, id, userId)}
          initialValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            allowedModules: user.allowedModules,
          }}
          passwordRequired={false}
          submitLabel="Salvar"
          availableModules={availableModules}
        />
      </div>
    </div>
  );
}
