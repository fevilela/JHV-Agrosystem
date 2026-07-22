import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function BalanceteePage() {
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true },
    orderBy: { code: "asc" },
    include: { lines: true },
  });
  const t = await getTranslations("contabilidade.balancete");
  const tType = await getTranslations("labels.chartAccountType");
  const locale = await getLocale();

  const rows = accounts.map((a) => {
    const totalDebito = a.lines.filter((l) => l.type === "DEBITO").reduce((s, l) => s + Number(l.amount), 0);
    const totalCredito = a.lines.filter((l) => l.type === "CREDITO").reduce((s, l) => s + Number(l.amount), 0);
    const saldo = calcularSaldo(a.nature, totalDebito, totalCredito);
    return { ...a, totalDebito, totalCredito, saldo };
  });

  const totalGeralDebito = rows.reduce((s, r) => s + r.totalDebito, 0);
  const totalGeralCredito = rows.reduce((s, r) => s + r.totalCredito, 0);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">{t("description")}</p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.code")}</th>
              <th className="px-4 py-3">{t("table.account")}</th>
              <th className="px-4 py-3">{t("table.type")}</th>
              <th className="px-4 py-3">{t("table.debit")}</th>
              <th className="px-4 py-3">{t("table.credit")}</th>
              <th className="px-4 py-3">{t("table.balance")}</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((r) => r.totalDebito !== 0 || r.totalCredito !== 0)
              .map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-neutral-700">{r.code}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{tType(r.type)}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(r.totalDebito, locale)}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(r.totalCredito, locale)}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{formatCurrency(r.saldo, locale)}</td>
                </tr>
              ))}
            {rows.every((r) => r.totalDebito === 0 && r.totalCredito === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold text-neutral-800">
              <td className="px-4 py-3" colSpan={3}>
                {t("grandTotal")}
              </td>
              <td className="px-4 py-3">{formatCurrency(totalGeralDebito, locale)}</td>
              <td className="px-4 py-3">{formatCurrency(totalGeralCredito, locale)}</td>
              <td className="px-4 py-3">
                {Math.abs(totalGeralDebito - totalGeralCredito) < 0.01 ? t("balanced") : t("unbalanced")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
