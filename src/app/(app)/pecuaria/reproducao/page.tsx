import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { reproductionMethodLabels, diagnosisResultLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteReproductionAction } from "./actions";

const diagnosisColor: Record<string, string> = {
  PRENHE: "bg-green-50 text-green-700",
  VAZIA: "bg-neutral-100 text-neutral-500",
  INDEFINIDO: "bg-amber-50 text-amber-700",
};

export default async function ReproducaoListPage() {
  const records = await prisma.reproduction.findMany({
    orderBy: { date: "desc" },
    include: { animal: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Reprodução</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {records.length} {records.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Link
          href="/pecuaria/reproducao/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Registro
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Diagnóstico</th>
              <th className="px-4 py-3">Previsão Parto</th>
              <th className="px-4 py-3">Parição</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum registro cadastrado ainda.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.animal.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">{reproductionMethodLabels[r.method]}</td>
                <td className="px-4 py-3">
                  {r.diagnosisResult ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diagnosisColor[r.diagnosisResult]}`}>
                      {diagnosisResultLabels[r.diagnosisResult]}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.expectedBirthDate)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.birthDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/reproducao/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteReproductionAction.bind(null, r.id)} />
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
