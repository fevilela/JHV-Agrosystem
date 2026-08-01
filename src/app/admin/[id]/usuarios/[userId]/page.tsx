import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserForm } from "../../add-user-form";
import { updateOrgUserAction, sendPasswordResetLinkAction } from "../../../actions";
import { InviteLinkBanner } from "../../../invite-link-banner";
import { ALWAYS_ON_MODULES } from "@/lib/nav";

export default async function EditOrgUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; userId: string }>;
  searchParams: Promise<{ inviteLink?: string; inviteEmail?: string; inviteStatus?: string }>;
}) {
  const { id, userId } = await params;
  const { inviteLink, inviteEmail, inviteStatus } = await searchParams;

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

      {inviteLink && inviteEmail && (
        <InviteLinkBanner link={inviteLink} email={inviteEmail} status={inviteStatus ?? "skipped"} />
      )}

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-7">
          <UserForm
            action={updateOrgUserAction.bind(null, id, userId)}
            initialValues={{
              name: user.name,
              email: user.email,
              role: user.role,
              allowedModules: user.allowedModules,
            }}
            mode="edit"
            submitLabel="Salvar"
            availableModules={availableModules}
          />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-neutral-800">
            Reenviar convite / redefinir senha
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            Gera um novo link pra {user.name} definir a senha — útil se o link anterior expirou ou
            se você quer resetar a senha dele sem saber a senha atual.
          </p>
          <form action={sendPasswordResetLinkAction.bind(null, id, userId)}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Enviar link de redefinição de senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
