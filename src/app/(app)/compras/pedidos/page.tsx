import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deletePurchaseOrderAction, markPurchaseOrderDeliveredAction } from "./actions";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  ENVIADO: "bg-blue-50 text-blue-700",
  ENTREGUE: "bg-green-50 text-green-700",
  CANCELADO: "bg-red-50 text-red-700",
};

export default async function PurchaseOrderListPage() {
  const { organizationId } = await requireOrg();
  const orders = await prisma.purchaseOrder.findMany({
    where: { organizationId },
    orderBy: { orderDate: "desc" },
    include: { supplier: true },
  });
  const t = await getTranslations("compras.pedidos");
  const tStatus = await getTranslations("labels.purchaseOrderStatus");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("recordCount", { count: orders.length })}
          </p>
        </div>
        <Link
          href="/compras/pedidos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          {t("new")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.date")}</th>
              <th className="px-4 py-3">{t("table.supplier")}</th>
              <th className="px-4 py-3">{t("table.invoice")}</th>
              <th className="px-4 py-3">{t("table.totalValue")}</th>
              <th className="px-4 py-3">{t("table.expectedDelivery")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(o.orderDate, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{o.supplier.name}</td>
                <td className="px-4 py-3 text-neutral-700">{o.invoiceNumber || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(o.totalValue, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(o.expectedDeliveryDate, locale)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status]}`}>
                    {tStatus(o.status)}
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
                          {t("markDelivered")}
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/compras/pedidos/${o.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("table.edit")}
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
