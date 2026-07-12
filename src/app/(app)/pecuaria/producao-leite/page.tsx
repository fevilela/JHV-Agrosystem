import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { milkShiftLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMilkAction } from "./actions";

export default async function ProducaoLeiteListPage() {
  const records = await prisma.milkProduction.findMany({
    orderBy: { date: "desc" },
    include: { animal: true },
  });

  const totalLitros = records.reduce((sum, r) => sum + Number(r.liters), 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Produção de Leite</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {records.length} ordenhas · {totalLitros.toLocaleString("pt-BR")} L no total
          </p>
        </div>
        <Link
          href="/pecuaria/producao-leite/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Ordenha
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3">Litros</th>
              <th className="px-4 py-3">CCS</th>
              <th className="px-4 py-3">CBT</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma ordenha registrada ainda.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.animal.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">{r.shift ? milkShiftLabels[r.shift] : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{String(r.liters)} L</td>
                <td className="px-4 py-3 text-neutral-700">{r.ccs ? String(r.ccs) : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{r.cbt ? String(r.cbt) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/producao-leite/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMilkAction.bind(null, r.id)} />
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
