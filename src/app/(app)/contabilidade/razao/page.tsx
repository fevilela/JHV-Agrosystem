import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function LivroRazaoPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const { accountId } = await searchParams;

  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true },
    orderBy: { code: "asc" },
  });

  const selected = accountId ? accounts.find((a) => a.id === accountId) : undefined;

  const lines = selected
    ? await prisma.journalEntryLine.findMany({
        where: { accountId: selected.id },
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
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Livro Razão</h1>
      <p className="mb-6 text-sm text-neutral-500">Extrato de movimentações por conta.</p>

      <form method="get" className="mb-6 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Conta</label>
          <select
            name="accountId"
            defaultValue={accountId || ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Selecione uma conta</option>
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
          Filtrar
        </button>
      </form>

      {!selected ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
          Selecione uma conta para ver o extrato.
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
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Histórico</th>
                <th className="px-4 py-3">Débito</th>
                <th className="px-4 py-3">Crédito</th>
                <th className="px-4 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {withBalance.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                    Nenhuma movimentação nessa conta ainda.
                  </td>
                </tr>
              )}
              {withBalance.map((l) => (
                <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{formatDate(l.journalEntry.date)}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.journalEntry.description}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.debito ? formatCurrency(l.debito) : "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.credito ? formatCurrency(l.credito) : "—"}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{formatCurrency(l.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
