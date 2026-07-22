import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deletePurchaseRequestAction, setPurchaseRequestStatusAction } from "./actions";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  APROVADA: "bg-green-50 text-green-700",
  REJEITADA: "bg-red-50 text-red-700",
  ATENDIDA: "bg-blue-50 text-blue-700",
};

export default async function PurchaseRequestListPage() {
  const { organizationId } = await requireOrg();
  const requests = await prisma.purchaseRequest.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
  });
  const t = await getTranslations("compras.solicitacoes");
  const tStatus = await getTranslations("labels.purchaseRequestStatus");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("recordCount", { count: requests.length })}
          </p>
        </div>
        <Link
          href="/compras/solicitacoes/novo"
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
              <th className="px-4 py-3">{t("table.item")}</th>
              <th className="px-4 py-3">{t("table.quantity")}</th>
              <th className="px-4 py-3">{t("table.requester")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.description}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {String(r.quantity)} {r.unit || ""}
                </td>
                <td className="px-4 py-3 text-neutral-700">{r.requestedBy || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                    {tStatus(r.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {r.status === "PENDENTE" && (
                      <>
                        <form action={setPurchaseRequestStatusAction.bind(null, r.id, "APROVADA")}>
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                          >
                            {t("actions.approve")}
                          </button>
                        </form>
                        <form action={setPurchaseRequestStatusAction.bind(null, r.id, "REJEITADA")}>
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                          >
                            {t("actions.reject")}
                          </button>
                        </form>
                      </>
                    )}
                    <Link
                      href={`/compras/solicitacoes/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("table.edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deletePurchaseRequestAction.bind(null, r.id)} />
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
