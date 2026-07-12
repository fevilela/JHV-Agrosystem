import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safraStatusLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteSafraAction } from "./actions";

const statusColor: Record<string, string> = {
  PLANEJADA: "bg-neutral-100 text-neutral-600",
  EM_ANDAMENTO: "bg-blue-50 text-blue-700",
  COLHIDA: "bg-green-50 text-green-700",
  CANCELADA: "bg-red-50 text-red-700",
};

export default async function SafraListPage() {
  const safras = await prisma.safra.findMany({
    orderBy: { dataInicio: "desc" },
    include: { talhao: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Planejamento de Safra</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {safras.length} {safras.length === 1 ? "safra cadastrada" : "safras cadastradas"}
          </p>
        </div>
        <Link
          href="/agricultura/safra/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Safra
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Safra</th>
              <th className="px-4 py-3">Talhão</th>
              <th className="px-4 py-3">Cultura</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Custo Previsto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {safras.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma safra cadastrada ainda.
                </td>
              </tr>
            )}
            {safras.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{s.name}</td>
                <td className="px-4 py-3 text-neutral-700">{s.talhao.code}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {s.cultura}
                  {s.variedade && <span className="block text-xs text-neutral-400">{s.variedade}</span>}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(s.dataInicio)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(s.custoPrevisto)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[s.status]}`}>
                    {safraStatusLabels[s.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/safra/${s.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteSafraAction.bind(null, s.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
