import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteDietAction } from "./actions";

export default async function NutricaoListPage() {
  const diets = await prisma.animalDiet.findMany({
    orderBy: { startDate: "desc" },
    include: { animal: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Nutrição</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {diets.length} {diets.length === 1 ? "dieta registrada" : "dietas registradas"}
          </p>
        </div>
        <Link
          href="/hipica/nutricao/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Dieta
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Qtd. Diária</th>
              <th className="px-4 py-3">Custo Diário</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {diets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma dieta registrada ainda.
                </td>
              </tr>
            )}
            {diets.map((d) => (
              <tr key={d.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{d.animal.name}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(d.startDate)}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {d.quantidadeDiariaKg ? `${d.quantidadeDiariaKg} kg` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(d.custoDiario)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {d.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/hipica/nutricao/${d.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteDietAction.bind(null, d.id)} />
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
