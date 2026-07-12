import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pastureRotationStatusLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deletePastureAction } from "./actions";

const statusColor: Record<string, string> = {
  EM_USO: "bg-green-50 text-green-700",
  DESCANSO: "bg-amber-50 text-amber-700",
};

export default async function PastagensListPage() {
  const pastures = await prisma.pasture.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { animals: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pastagens</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {pastures.length} {pastures.length === 1 ? "pastagem cadastrada" : "pastagens cadastradas"}
          </p>
        </div>
        <Link
          href="/pecuaria/pastagens/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Pastagem
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Lotação</th>
              <th className="px-4 py-3">Altura Capim</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pastures.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma pastagem cadastrada ainda.
                </td>
              </tr>
            )}
            {pastures.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{p.code}</td>
                <td className="px-4 py-3 text-neutral-700">{p.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {p.areaHectares ? `${p.areaHectares} ha` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {p._count.animals}
                  {p.capacityHead ? ` / ${p.capacityHead}` : ""}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {p.grassHeightCm ? `${p.grassHeightCm} cm` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[p.rotationStatus]}`}>
                    {pastureRotationStatusLabels[p.rotationStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/pastagens/${p.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deletePastureAction.bind(null, p.id)} />
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
