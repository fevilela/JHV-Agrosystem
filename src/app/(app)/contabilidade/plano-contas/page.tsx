import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteChartAccountAction } from "./actions";

export default async function ChartAccountListPage() {
  const accounts = await prisma.chartAccount.findMany({
    orderBy: { code: "asc" },
  });
  const t = await getTranslations("contabilidade.planoContas");
  const tType = await getTranslations("labels.chartAccountType");
  const tNature = await getTranslations("labels.chartAccountNature");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("accountCount", { count: accounts.length })}
          </p>
        </div>
        <Link
          href="/contabilidade/plano-contas/novo"
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
              <th className="px-4 py-3">{t("table.code")}</th>
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="px-4 py-3">{t("table.type")}</th>
              <th className="px-4 py-3">{t("table.nature")}</th>
              <th className="px-4 py-3">{t("table.analytic")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {accounts.map((a) => {
              const depth = a.code.split(".").length - 1;
              return (
                <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-neutral-700">{a.code}</td>
                  <td className="px-4 py-3 text-neutral-700" style={{ paddingLeft: `${depth * 16 + 16}px` }}>
                    {a.analytic ? a.name : <span className="font-semibold">{a.name}</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{tType(a.type)}</td>
                  <td className="px-4 py-3 text-neutral-700">{tNature(a.nature)}</td>
                  <td className="px-4 py-3 text-neutral-700">{a.analytic ? t("yes") : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {a.active ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/contabilidade/plano-contas/${a.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title={t("table.edit")}
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteChartAccountAction.bind(null, a.id)} />
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
