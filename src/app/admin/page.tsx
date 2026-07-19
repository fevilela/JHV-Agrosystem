import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { navGroups } from "@/lib/nav";

export default async function AdminOrganizationsPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } }, whatsappConnection: true },
  });

  const labelByKey = new Map(navGroups.map((g) => [g.key, g.label]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Clientes da JHV</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {organizations.length}{" "}
            {organizations.length === 1 ? "organização cadastrada" : "organizações cadastradas"}
          </p>
        </div>
        <Link
          href="/admin/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Organização
        </Link>
      </div>

      {organizations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhuma organização cadastrada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/admin/${org.id}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-neutral-900">{org.name}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    org.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {org.active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {org.cpfCnpj || "CNPJ não informado"}
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                {org._count.users} {org._count.users === 1 ? "usuário" : "usuários"}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Módulos:{" "}
                {org.allowedModules.length > 0
                  ? org.allowedModules.map((m) => labelByKey.get(m) ?? m).join(", ")
                  : "nenhum"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Mercado Pago:{" "}
                {org.mpAccessToken ? (
                  <span className="text-green-700">configurado</span>
                ) : (
                  <span className="text-amber-600">pendente</span>
                )}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                WhatsApp:{" "}
                {org.whatsappConnection ? (
                  <span className="text-green-700">conectado</span>
                ) : (
                  <span className="text-amber-600">não conectado</span>
                )}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                E-mail (Resend):{" "}
                {org.resendApiKey ? (
                  <span className="text-green-700">configurado</span>
                ) : (
                  <span className="text-amber-600">pendente</span>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
