import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteWeightAction } from "./actions";

export default async function PesagensListPage() {
  const records = await prisma.weightRecord.findMany({
    orderBy: [{ animalId: "asc" }, { date: "asc" }],
    include: { animal: true },
  });

  const withGmd = records.map((r, i) => {
    const prev = records[i - 1];
    let gmd: number | null = null;
    if (prev && prev.animalId === r.animalId) {
      const days =
        (new Date(r.date).getTime() - new Date(prev.date).getTime()) /
        (1000 * 60 * 60 * 24);
      if (days > 0) {
        gmd = (Number(r.weightKg) - Number(prev.weightKg)) / days;
      }
    }
    return { ...r, gmd };
  });

  withGmd.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pesagens</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {records.length} {records.length === 1 ? "pesagem registrada" : "pesagens registradas"}
          </p>
        </div>
        <Link
          href="/pecuaria/pesagens/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Pesagem
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Peso</th>
              <th className="px-4 py-3">GMD (kg/dia)</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {withGmd.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma pesagem registrada ainda.
                </td>
              </tr>
            )}
            {withGmd.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.animal.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">{String(r.weightKg)} kg</td>
                <td className="px-4 py-3 text-neutral-700">
                  {r.gmd !== null ? (
                    <span className={r.gmd >= 0 ? "text-green-700" : "text-red-600"}>
                      {r.gmd.toFixed(2)} kg/dia
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/pesagens/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteWeightAction.bind(null, r.id)} />
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
