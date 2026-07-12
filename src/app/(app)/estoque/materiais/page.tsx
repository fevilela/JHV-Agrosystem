import Link from "next/link";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { stockCategoryLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteStockItemAction } from "./actions";

export default async function StockItemListPage() {
  const items = await prisma.stockItem.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Materiais e Insumos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} {items.length === 1 ? "item cadastrado" : "itens cadastrados"}
          </p>
        </div>
        <Link
          href="/estoque/materiais/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Item
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Estoque Atual</th>
              <th className="px-4 py-3">Estoque Mínimo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum item cadastrado ainda.
                </td>
              </tr>
            )}
            {items.map((item) => {
              const low =
                item.minQuantity !== null &&
                Number(item.currentQuantity) < Number(item.minQuantity);
              return (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-800">{item.code}</td>
                  <td className="px-4 py-3 text-neutral-700">{item.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{stockCategoryLabels[item.category]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        low ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {low && <AlertTriangle size={12} />}
                      {String(item.currentQuantity)} {item.unit || ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {item.minQuantity ? `${item.minQuantity} ${item.unit || ""}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/estoque/materiais/${item.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteStockItemAction.bind(null, item.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
