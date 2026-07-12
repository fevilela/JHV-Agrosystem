import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { livestockCategoryLabels, livestockStatusLabels, animalSexoLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteLivestockAnimalAction } from "./actions";

const statusColor: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  VENDIDO: "bg-blue-50 text-blue-700",
  ABATIDO: "bg-neutral-100 text-neutral-500",
  OBITO: "bg-neutral-100 text-neutral-500",
  INATIVO: "bg-neutral-100 text-neutral-500",
};

export default async function LivestockAnimalListPage() {
  const animals = await prisma.livestockAnimal.findMany({
    orderBy: { brinco: "asc" },
    include: { lote: true, pasture: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Cadastro Animal</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {animals.length} {animals.length === 1 ? "animal cadastrado" : "animais cadastrados"}
          </p>
        </div>
        <Link
          href="/pecuaria/cadastro-animal/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Animal
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Brinco</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Sexo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Lote</th>
              <th className="px-4 py-3">Pasto</th>
              <th className="px-4 py-3">Peso</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {animals.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum animal cadastrado ainda.
                </td>
              </tr>
            )}
            {animals.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{a.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">{a.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{a.sexo ? animalSexoLabels[a.sexo] : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{livestockCategoryLabels[a.category]}</td>
                <td className="px-4 py-3 text-neutral-700">{a.lote?.code || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{a.pasture?.code || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{a.pesoAtual ? `${a.pesoAtual} kg` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status]}`}>
                    {livestockStatusLabels[a.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/cadastro-animal/${a.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteLivestockAnimalAction.bind(null, a.id)} />
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
