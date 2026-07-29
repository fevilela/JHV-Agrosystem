import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { faseMudaLabels, mudaLoteStatusLabels } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import type { FaseMuda, MudaLoteStatus } from "@prisma/client";

const statusColor: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  DESCARTADO: "bg-red-50 text-red-700",
  VENDIDO: "bg-blue-50 text-blue-700",
  DOADO: "bg-amber-50 text-amber-700",
  PERDIDO: "bg-red-50 text-red-700",
};

export default async function MudaLotesListPage({
  searchParams,
}: {
  searchParams: Promise<{ fase?: string; status?: string }>;
}) {
  const { organizationId } = await requireModule("viveiro");
  const { fase, status } = await searchParams;

  const lotes = await prisma.mudaLote.findMany({
    where: {
      organizationId,
      ...(fase ? { faseAtual: fase as FaseMuda } : {}),
      ...(status ? { status: status as MudaLoteStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { especie: true, viveiro: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Lotes de Produção</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {lotes.length} {lotes.length === 1 ? "lote encontrado" : "lotes encontrados"}
          </p>
        </div>
        <Link
          href="/viveiro/lotes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Lote
        </Link>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Fase</label>
          <select
            name="fase"
            defaultValue={fase ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todas</option>
            {Object.entries(faseMudaLabels).map(([value, label]) => (
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
            {Object.entries(mudaLoteStatusLabels).map(([value, label]) => (
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
              <th className="px-4 py-3">Espécie</th>
              <th className="px-4 py-3">Viveiro</th>
              <th className="px-4 py-3">Fase Atual</th>
              <th className="px-4 py-3">Qtd. Atual</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum lote encontrado.
                </td>
              </tr>
            )}
            {lotes.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/viveiro/lotes/${l.id}`} className="font-medium text-brand-800 hover:underline">
                    {l.code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{l.especie.nomePopular}</td>
                <td className="px-4 py-3 text-neutral-700">{l.viveiro.code}</td>
                <td className="px-4 py-3 text-neutral-700">{faseMudaLabels[l.faseAtual]}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {l.quantidadeAtual} / {l.quantidadeInicial}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[l.status]}`}>
                    {mudaLoteStatusLabels[l.status]}
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
