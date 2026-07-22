import Link from "next/link";
import { Plus, AlertTriangle, Check } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { consumeStockBatchAction, deleteStockBatchAction } from "./actions";

export default async function StockBatchListPage() {
  const batches = await prisma.stockBatch.findMany({
    orderBy: { expiryDate: "asc" },
    include: { stockItem: true },
  });
  const t = await getTranslations("estoque.lotes");
  const tBatchStatus = await getTranslations("labels.stockBatchStatus");
  const locale = await getLocale();

  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("recordCount", { count: batches.length })}
          </p>
        </div>
        <Link
          href="/estoque/lotes/novo"
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
              <th className="px-4 py-3">{t("table.item")}</th>
              <th className="px-4 py-3">{t("table.batch")}</th>
              <th className="px-4 py-3">{t("table.quantity")}</th>
              <th className="px-4 py-3">{t("table.validity")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {batches.map((b) => {
              const expired = b.expiryDate && new Date(b.expiryDate) < now;
              const expiringSoon = b.expiryDate && !expired && new Date(b.expiryDate) <= soon;
              return (
                <tr key={b.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">
                    {b.stockItem.name}
                    <span className="block text-xs text-neutral-400">{b.stockItem.code}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{b.batchNumber || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {String(b.quantity)} {b.stockItem.unit || ""}
                  </td>
                  <td className="px-4 py-3">
                    {b.expiryDate ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          expired
                            ? "bg-red-50 text-red-700"
                            : expiringSoon
                              ? "bg-amber-50 text-amber-700"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {(expired || expiringSoon) && <AlertTriangle size={12} />}
                        {formatDate(b.expiryDate, locale)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === "DISPONIVEL"
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {tBatchStatus(b.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "DISPONIVEL" && (
                        <form action={consumeStockBatchAction.bind(null, b.id)}>
                          <button
                            type="submit"
                            title={t("consume")}
                            className="rounded-md p-1.5 text-neutral-400 transition hover:bg-green-50 hover:text-green-700"
                          >
                            <Check size={16} />
                          </button>
                        </form>
                      )}
                      <DeleteButton onDelete={deleteStockBatchAction.bind(null, b.id)} />
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
