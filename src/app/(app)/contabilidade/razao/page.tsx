import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function LivroRazaoPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const { accountId } = await searchParams;
  const { organizationId } = await requireOrg();

  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, organizationId },
    orderBy: { code: "asc" },
  });
  const t = await getTranslations("contabilidade.razao");
  const locale = await getLocale();

  const selected = accountId ? accounts.find((a) => a.id === accountId) : undefined;

  const lines = selected
    ? await prisma.journalEntryLine.findMany({
        where: { accountId: selected.id, journalEntry: { organizationId } },
        include: { journalEntry: true },
        orderBy: { journalEntry: { date: "asc" } },
      })
    : [];

  let running = 0;
  const withBalance = lines.map((l) => {
    const debito = l.type === "DEBITO" ? Number(l.amount) : 0;
    const credito = l.type === "CREDITO" ? Number(l.amount) : 0;
    running += calcularSaldo(selected!.nature, debito, credito);
    return { ...l, debito, credito, balance: running };
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">{t("description")}</p>

      <form method="get" className="mb-6 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-neutral-700">{t("accountLabel")}</label>
          <select
            name="accountId"
            defaultValue={accountId || ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">{t("selectAccount")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          {t("filter")}
        </button>
      </form>

      {!selected ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
          {t("selectPrompt")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-700">
              {selected.code} — {selected.name}
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">{t("table.date")}</th>
                <th className="px-4 py-3">{t("table.history")}</th>
                <th className="px-4 py-3">{t("table.debit")}</th>
                <th className="px-4 py-3">{t("table.credit")}</th>
                <th className="px-4 py-3">{t("table.balance")}</th>
              </tr>
            </thead>
            <tbody>
              {withBalance.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                    {t("noMovements")}
                  </td>
                </tr>
              )}
              {withBalance.map((l) => (
                <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{formatDate(l.journalEntry.date, locale)}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.journalEntry.description}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.debito ? formatCurrency(l.debito, locale) : "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.credito ? formatCurrency(l.credito, locale) : "—"}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{formatCurrency(l.balance, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
