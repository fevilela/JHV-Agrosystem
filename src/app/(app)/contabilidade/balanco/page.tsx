import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function BalancoPatrimonialPage() {
  const { organizationId } = await requireOrg();
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, type: { in: ["ATIVO", "PASSIVO", "PATRIMONIO_LIQUIDO"] }, organizationId },
    orderBy: { code: "asc" },
    include: { lines: { where: { journalEntry: { organizationId } } } },
  });
  const t = await getTranslations("contabilidade.balanco");
  const locale = await getLocale();

  const rows = accounts
    .map((a) => {
      const totalDebito = a.lines.filter((l) => l.type === "DEBITO").reduce((s, l) => s + Number(l.amount), 0);
      const totalCredito = a.lines.filter((l) => l.type === "CREDITO").reduce((s, l) => s + Number(l.amount), 0);
      const saldo = calcularSaldo(a.nature, totalDebito, totalCredito);
      return { ...a, saldo };
    })
    .filter((r) => r.saldo !== 0);

  const ativo = rows.filter((r) => r.type === "ATIVO");
  const passivo = rows.filter((r) => r.type === "PASSIVO");
  const patrimonioLiquido = rows.filter((r) => r.type === "PATRIMONIO_LIQUIDO");

  const totalAtivo = ativo.reduce((s, r) => s + r.saldo, 0);
  const totalPassivo = passivo.reduce((s, r) => s + r.saldo, 0);
  const totalPL = patrimonioLiquido.reduce((s, r) => s + r.saldo, 0);
  const totalPassivoPL = totalPassivo + totalPL;

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">{t("description")}</p>

      <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t("notice")}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-700">{t("assets")}</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {ativo.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-neutral-400">{t("noBalance")}</td>
                </tr>
              )}
              {ativo.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700">{formatCurrency(r.saldo, locale)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold text-neutral-800">
                <td className="px-4 py-3">{t("totalAssets")}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(totalAtivo, locale)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-700">{t("liabilitiesEquity")}</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {passivo.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700">{formatCurrency(r.saldo, locale)}</td>
                </tr>
              ))}
              {patrimonioLiquido.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 text-neutral-700">
                    {r.code} — {r.name}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700">{formatCurrency(r.saldo, locale)}</td>
                </tr>
              ))}
              {passivo.length === 0 && patrimonioLiquido.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-sm text-neutral-400">
                    {t("noBalance")}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold text-neutral-800">
                <td className="px-4 py-3">{t("totalLiabilitiesEquity")}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(totalPassivoPL, locale)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        {t("difference")}: <strong>{formatCurrency(totalAtivo - totalPassivoPL, locale)}</strong>
      </p>
    </div>
  );
}
