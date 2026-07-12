import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { purchaseOrderStatusLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deletePurchaseOrderAction, markPurchaseOrderDeliveredAction } from "./actions";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  ENVIADO: "bg-blue-50 text-blue-700",
  ENTREGUE: "bg-green-50 text-green-700",
  CANCELADO: "bg-red-50 text-red-700",
};

export default async function PurchaseOrderListPage() {
  const orders = await prisma.purchaseOrder.findMany({
    orderBy: { orderDate: "desc" },
    include: { supplier: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pedidos de Compra</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          </p>
        </div>
        <Link
          href="/compras/pedidos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Pedido
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Nota Fiscal</th>
              <th className="px-4 py-3">Valor Total</th>
              <th className="px-4 py-3">Entrega Prevista</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum pedido cadastrado ainda.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(o.orderDate)}</td>
                <td className="px-4 py-3 text-neutral-700">{o.supplier.name}</td>
                <td className="px-4 py-3 text-neutral-700">{o.invoiceNumber || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(o.totalValue)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(o.expectedDeliveryDate)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status]}`}>
                    {purchaseOrderStatusLabels[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {o.status !== "ENTREGUE" && o.status !== "CANCELADO" && (
                      <form action={markPurchaseOrderDeliveredAction.bind(null, o.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                        >
                          Marcar entregue
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/compras/pedidos/${o.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deletePurchaseOrderAction.bind(null, o.id)} />
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
