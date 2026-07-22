import Link from "next/link";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteEpiAction } from "../epi-actions";

export default async function EpiListPage() {
  const issuances = await prisma.epiIssuance.findMany({
    orderBy: { issueDate: "desc" },
    include: { employee: true },
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const t = await getTranslations("rh.epis");
  const locale = await getLocale();

  return (
    <div>
      <Link href="/rh/treinamentos" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← {t("backLink")}
      </Link>
      <div className="mb-6 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: issuances.length })}
          </p>
        </div>
        <Link
          href="/rh/treinamentos/epis/novo"
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
              <th className="px-4 py-3">{t("table.employee")}</th>
              <th className="px-4 py-3">{t("table.item")}</th>
              <th className="px-4 py-3">{t("table.issueDate")}</th>
              <th className="px-4 py-3">{t("table.validUntil")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {issuances.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {issuances.map((i) => {
              const expired = i.validUntil && new Date(i.validUntil) < now;
              const expiringSoon = i.validUntil && !expired && new Date(i.validUntil) <= soon;
              return (
                <tr key={i.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{i.employee.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{i.itemName}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatDate(i.issueDate, locale)}</td>
                  <td className="px-4 py-3">
                    {i.validUntil ? (
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
                        {formatDate(i.validUntil, locale)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/rh/treinamentos/epis/${i.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title={t("edit")}
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteEpiAction.bind(null, i.id)} />
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
