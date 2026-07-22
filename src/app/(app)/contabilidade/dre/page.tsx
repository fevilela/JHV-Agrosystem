import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function DrePage() {
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, type: { in: ["RECEITA", "CUSTO", "DESPESA"] } },
    orderBy: { code: "asc" },
    include: { lines: true },
  });
  const t = await getTranslations("contabilidade.dre");
  const locale = await getLocale();

  const rows = accounts
    .map((a) => {
      const totalDebito = a.lines.filter((l) => l.type === "DEBITO").reduce((s, l) => s + Number(l.amount), 0);
      const totalCredito = a.lines.filter((l) => l.type === "CREDITO").reduce((s, l) => s + Number(l.amount), 0);
      const saldo = calcularSaldo(a.nature, totalDebito, totalCredito);
      return { ...a, saldo };
    })
    .filter((r) => r.saldo !== 0);

  const receitas = rows.filter((r) => r.type === "RECEITA");
  const custos = rows.filter((r) => r.type === "CUSTO");
  const despesas = rows.filter((r) => r.type === "DESPESA");

  const totalReceitas = receitas.reduce((s, r) => s + r.saldo, 0);
  const totalCustos = custos.reduce((s, r) => s + r.saldo, 0);
  const totalDespesas = despesas.reduce((s, r) => s + r.saldo, 0);
  const resultado = totalReceitas - totalCustos - totalDespesas;

  function Section({ title, rows }: { title: string; rows: typeof receitas }) {
    return (
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-700">{title}</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-400">{t("noEntries")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-1.5 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="py-1.5 text-right text-neutral-700">{formatCurrency(r.saldo, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">
        {t("title")}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">{t("description")}</p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <Section title={t("revenue")} rows={receitas} />
        <Section title={t("costs")} rows={custos} />
        <Section title={t("expenses")} rows={despesas} />

        <div className="mt-6 space-y-1 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between text-neutral-700">
            <span>{t("totalRevenue")}</span>
            <span>{formatCurrency(totalReceitas, locale)}</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>{t("totalCosts")}</span>
            <span>{formatCurrency(totalCustos, locale)}</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>{t("totalExpenses")}</span>
            <span>{formatCurrency(totalDespesas, locale)}</span>
          </div>
          <div
            className={`flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold ${
              resultado >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            <span>{resultado >= 0 ? t("profit") : t("loss")}</span>
            <span>{formatCurrency(resultado, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
