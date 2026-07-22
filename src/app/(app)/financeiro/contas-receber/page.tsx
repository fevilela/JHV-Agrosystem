import Link from "next/link";
import { Plus, Pencil, FileCheck } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { ExportButton } from "@/components/crud/export-button";
import { GerarBoletoButton } from "./gerar-boleto-button";
import { deleteReceivableAction, markReceivableReceivedAction, cancelarBoletoAction } from "./actions";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  PAGO: "bg-green-50 text-green-700",
  ATRASADO: "bg-red-50 text-red-700",
  CANCELADO: "bg-neutral-100 text-neutral-500",
};

export default async function ReceivableListPage() {
  const { organizationId } = await requireOrg();
  const entries = await prisma.financeEntry.findMany({
    where: { type: "RECEBER", organizationId },
    orderBy: { dueDate: "asc" },
    include: { client: true, costCenter: true },
  });

  const now = new Date();
  const totalPendente = entries
    .filter((e) => e.status === "PENDENTE" || e.status === "ATRASADO")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const t = await getTranslations("financeiro.contasReceber");
  const tStatus = await getTranslations("labels.financeEntryStatus");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("summary", { count: entries.length, amount: formatCurrency(totalPendente, locale) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton baseHref="/api/export/contas-receber" />
          <Link
            href="/financeiro/contas-receber/novo"
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            {t("new")}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.dueDate")}</th>
              <th className="px-4 py-3">{t("table.description")}</th>
              <th className="px-4 py-3">{t("table.client")}</th>
              <th className="px-4 py-3">{t("table.costCenter")}</th>
              <th className="px-4 py-3">{t("table.amount")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {entries.map((e) => {
              const displayStatus =
                e.status === "PENDENTE" && new Date(e.dueDate) < now ? "ATRASADO" : e.status;
              return (
                <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{formatDate(e.dueDate, locale)}</td>
                  <td className="px-4 py-3 text-neutral-700">{e.description}</td>
                  <td className="px-4 py-3 text-neutral-700">{e.client?.name || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{e.costCenter?.name || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatCurrency(e.amount, locale)}
                    {e.originalAmount != null &&
                      Number(e.originalAmount) !== Number(e.amount) && (
                        <span className="ml-1 text-xs text-red-600">
                          {t("originalAmount", { amount: formatCurrency(e.originalAmount, locale) })}
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[displayStatus]}`}>
                      {tStatus(displayStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {e.paymentMethod === "BOLETO" &&
                        e.status !== "PAGO" &&
                        e.status !== "CANCELADO" &&
                        (e.boletoUrl ? (
                          <>
                            <a
                              href={e.boletoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={e.boletoBarcode || undefined}
                              className="flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-brand-700 hover:bg-brand-50"
                            >
                              <FileCheck size={13} />
                              {t("viewBoleto")}
                            </a>
                            <DeleteButton
                              onDelete={cancelarBoletoAction.bind(null, e.id)}
                              variant="cancel"
                              title={t("cancelBoleto")}
                              confirmLabel={t("cancelBoletoConfirm")}
                            />
                          </>
                        ) : (
                          <GerarBoletoButton entryId={e.id} />
                        ))}
                      {e.status !== "PAGO" && e.status !== "CANCELADO" && (
                        <form action={markReceivableReceivedAction.bind(null, e.id)}>
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                          >
                            {t("markReceived")}
                          </button>
                        </form>
                      )}
                      <Link
                        href={`/financeiro/contas-receber/${e.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title={t("edit")}
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteReceivableAction.bind(null, e.id)} />
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
