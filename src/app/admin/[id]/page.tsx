import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrganizationForm } from "../organization-form";
import { updateOrganizationAction, createOrgUserAction, deleteOrgUserAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { UserForm } from "./add-user-form";
import { navGroups, RETROFITTED_MODULES } from "@/lib/nav";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  FUNCIONARIO: "Funcionário",
};

const moduleLabels = new Map(
  navGroups.filter((g) => RETROFITTED_MODULES.includes(g.key)).map((g) => [g.key, g.label])
);

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: { users: { orderBy: { createdAt: "asc" } }, whatsappConnection: true },
  });

  if (!organization) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Clientes da JHV
      </Link>
      <h1 className="mt-1 mb-6 text-xl font-semibold text-neutral-900">{organization.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="max-w-3xl">
          <OrganizationForm
            action={updateOrganizationAction.bind(null, id)}
            initialValues={{
              name: organization.name,
              cpfCnpj: organization.cpfCnpj,
              email: organization.email,
              phone: organization.phone,
              address: organization.address,
              zipCode: organization.zipCode,
              streetNumber: organization.streetNumber,
              neighborhood: organization.neighborhood,
              city: organization.city,
              state: organization.state,
              allowedModules: organization.allowedModules,
              active: organization.active,
              hasMpToken: Boolean(organization.mpAccessToken),
              hasResendKey: Boolean(organization.resendApiKey),
              resendFromEmail: organization.resendFromEmail,
            }}
            showActiveToggle
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              WhatsApp
            </h2>
            {organization.whatsappConnection ? (
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Conectado
                {organization.whatsappConnection.businessName
                  ? ` — ${organization.whatsappConnection.businessName}`
                  : ""}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                Não conectado
              </div>
            )}
            <p className="mt-2 text-xs text-neutral-400">
              A conexão do WhatsApp não é feita por aqui — o Meta exige que o próprio dono do
              número faça o login. Peça pra alguém da organização entrar no sistema e conectar em
              Financeiro → Conectar WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Usuários
            </h2>
            {organization.users.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhum usuário cadastrado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {organization.users.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{user.name}</p>
                      <p className="text-xs text-neutral-500">
                        {user.email} · {roleLabels[user.role] ?? user.role}
                        {user.isSuperAdmin ? " · super-admin" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {user.role === "ADMIN"
                          ? "Acesso total (administrador)"
                          : user.allowedModules.length > 0
                            ? user.allowedModules.map((m) => moduleLabels.get(m) ?? m).join(", ")
                            : "Nenhum módulo liberado"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/${id}/usuarios/${user.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteOrgUserAction.bind(null, id, user.id)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Adicionar Usuário
            </h2>
            <UserForm
              action={createOrgUserAction.bind(null, id)}
              passwordRequired
              submitLabel="Adicionar Usuário"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
