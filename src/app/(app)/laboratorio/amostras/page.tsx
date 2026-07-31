import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { amostraTipoLabels, amostraStatusLabels, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import type { AmostraTipo, AmostraStatus } from "@prisma/client";

const statusColor: Record<string, string> = {
  RECEBIDA: "bg-blue-50 text-blue-700",
  EM_ANALISE: "bg-amber-50 text-amber-700",
  CONCLUIDA: "bg-green-50 text-green-700",
  CANCELADA: "bg-red-50 text-red-700",
};

export default async function AmostrasListPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  const { organizationId } = await requireModule("laboratorio");
  const { tipo, status } = await searchParams;

  const amostras = await prisma.amostra.findMany({
    where: {
      organizationId,
      ...(tipo ? { tipo: tipo as AmostraTipo } : {}),
      ...(status ? { status: status as AmostraStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { propriedadeProdutor: { include: { produtor: true } }, talhaoProdutor: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Amostras</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {amostras.length} {amostras.length === 1 ? "amostra encontrada" : "amostras encontradas"}
          </p>
        </div>
        <Link
          href="/laboratorio/amostras/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Amostra
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
            {Object.entries(amostraTipoLabels).map(([value, label]) => (
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
            {Object.entries(amostraStatusLabels).map(([value, label]) => (
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
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Produtor</th>
              <th className="px-4 py-3">Propriedade/Talhão</th>
              <th className="px-4 py-3">Data Coleta</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {amostras.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma amostra encontrada.
                </td>
              </tr>
            )}
            {amostras.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/laboratorio/amostras/${a.id}`} className="font-medium text-brand-800 hover:underline">
                    {a.code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{amostraTipoLabels[a.tipo]}</td>
                <td className="px-4 py-3 text-neutral-700">{a.propriedadeProdutor.produtor.name}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {a.propriedadeProdutor.name}
                  {a.talhaoProdutor ? ` / ${a.talhaoProdutor.code}` : ""}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(a.dataColeta)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status]}`}>
                    {amostraStatusLabels[a.status]}
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
