import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auditoriaTipoLabels, auditoriaStatusLabels, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import type { AuditoriaTipo, AuditoriaStatus } from "@prisma/client";

const statusColor: Record<string, string> = {
  EM_ANDAMENTO: "bg-amber-50 text-amber-700",
  APROVADA: "bg-green-50 text-green-700",
  REPROVADA: "bg-red-50 text-red-700",
  PENDENTE_ACAO: "bg-blue-50 text-blue-700",
};

export default async function AuditoriasListPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  const { organizationId } = await requireModule("auditoria");
  const { tipo, status } = await searchParams;

  const auditorias = await prisma.auditoriaAgricola.findMany({
    where: {
      organizationId,
      ...(tipo ? { tipo: tipo as AuditoriaTipo } : {}),
      ...(status ? { status: status as AuditoriaStatus } : {}),
    },
    orderBy: { dataAuditoria: "desc" },
    include: { propriedadeProdutor: { include: { produtor: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Auditorias Agrícolas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {auditorias.length} {auditorias.length === 1 ? "auditoria encontrada" : "auditorias encontradas"}
          </p>
        </div>
        <Link
          href="/auditoria/auditorias/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Auditoria
        </Link>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo</label>
          <select
            name="tipo"
            defaultValue={tipo ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todos</option>
            {Object.entries(auditoriaTipoLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Status</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todos</option>
            {Object.entries(auditoriaStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Propriedade</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Auditor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {auditorias.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma auditoria encontrada.
                </td>
              </tr>
            )}
            {auditorias.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/auditoria/auditorias/${a.id}`} className="font-medium text-brand-800 hover:underline">
                    {a.propriedadeProdutor.name}
                  </Link>
                  <p className="text-xs text-neutral-400">{a.propriedadeProdutor.produtor.name}</p>
                </td>
                <td className="px-4 py-3 text-neutral-700">{auditoriaTipoLabels[a.tipo]}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(a.dataAuditoria)}</td>
                <td className="px-4 py-3 text-neutral-700">{a.auditorNome || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status]}`}>
                    {auditoriaStatusLabels[a.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
