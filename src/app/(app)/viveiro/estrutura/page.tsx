import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { coberturaTipoLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteViveiroAction } from "./actions";

export default async function ViveiroEstruturaListPage() {
  const { organizationId } = await requireModule("viveiro");
  const viveiros = await prisma.viveiro.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
    include: { property: true, _count: { select: { lotes: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Estrutura Física</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {viveiros.length} {viveiros.length === 1 ? "viveiro cadastrado" : "viveiros cadastrados"}
          </p>
        </div>
        <Link
          href="/viveiro/estrutura/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Viveiro
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cobertura</th>
              <th className="px-4 py-3">Área (m²)</th>
              <th className="px-4 py-3">Propriedade</th>
              <th className="px-4 py-3">Lotes</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {viveiros.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum viveiro cadastrado ainda.
                </td>
              </tr>
            )}
            {viveiros.map((v) => (
              <tr key={v.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{v.code}</td>
                <td className="px-4 py-3 text-neutral-700">{v.name}</td>
                <td className="px-4 py-3 text-neutral-700">{coberturaTipoLabels[v.tipoCobertura]}</td>
                <td className="px-4 py-3 text-neutral-700">{v.areaM2 ? String(v.areaM2) : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{v.property?.name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{v._count.lotes}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/viveiro/estrutura/${v.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteViveiroAction.bind(null, v.id)} />
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
