import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { livestockCategoryLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteLoteAction } from "../lote-actions";

export default async function LotesListPage() {
  const lotes = await prisma.lote.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { animals: true } } },
  });

  return (
    <div>
      <Link href="/pecuaria/manejo" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Manejo
      </Link>
      <div className="mb-6 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Lotes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {lotes.length} {lotes.length === 1 ? "lote cadastrado" : "lotes cadastrados"}
          </p>
        </div>
        <Link
          href="/pecuaria/manejo/lotes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Lote
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Animais</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum lote cadastrado ainda.
                </td>
              </tr>
            )}
            {lotes.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{l.code}</td>
                <td className="px-4 py-3 text-neutral-700">{l.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {l.category ? livestockCategoryLabels[l.category] : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{l._count.animals}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/manejo/lotes/${l.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteLoteAction.bind(null, l.id)} />
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
