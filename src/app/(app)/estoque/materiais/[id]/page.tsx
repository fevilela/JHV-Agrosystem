import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { stockItemFields } from "../fields";
import { updateStockItemAction } from "../actions";
import { stockBatchStatusLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { consumeStockBatchAction, deleteStockBatchAction } from "../../lotes/actions";
import { Check } from "lucide-react";

export default async function StockItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.stockItem.findUnique({
    where: { id },
    include: { batches: { orderBy: { expiryDate: "asc" } } },
  });

  if (!item) notFound();

  return (
    <div>
      <Link href="/estoque/materiais" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Materiais e Insumos
      </Link>
      <h1 className="mt-1 mb-6 text-xl font-semibold text-neutral-900">
        {item.name} — Estoque atual: {String(item.currentQuantity)} {item.unit || ""}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={stockItemFields}
          action={updateStockItemAction.bind(null, id)}
          initialValues={item}
          backHref="/estoque/materiais"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Lotes
            </h2>
            <Link
              href="/estoque/lotes/novo"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              + Novo lote
            </Link>
          </div>
          {item.batches.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhum lote cadastrado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {item.batches.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-neutral-800">
                      {b.batchNumber || "Sem número"}
                    </span>{" "}
                    <span className="text-neutral-600">{String(b.quantity)}</span>
                    <span className="block text-xs text-neutral-400">
                      Validade: {formatDate(b.expiryDate)} · {stockBatchStatusLabels[b.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.status === "DISPONIVEL" && (
                      <form action={consumeStockBatchAction.bind(null, b.id)}>
                        <button
                          type="submit"
                          title="Consumir"
                          className="rounded-md p-1.5 text-neutral-400 transition hover:bg-green-50 hover:text-green-700"
                        >
                          <Check size={16} />
                        </button>
                      </form>
                    )}
                    <DeleteButton onDelete={deleteStockBatchAction.bind(null, b.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
