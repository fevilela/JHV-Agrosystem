import { prisma } from "@/lib/prisma";
import { formatCurrency, chartAccountTypeLabels } from "@/lib/labels";
import { calcularSaldo } from "@/lib/contabilidade";

export default async function BalanceteePage() {
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true },
    orderBy: { code: "asc" },
    include: { lines: true },
  });

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
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Balancete de Verificação</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Total de débitos e créditos por conta, desde o início dos lançamentos.
      </p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Débito</th>
              <th className="px-4 py-3">Crédito</th>
              <th className="px-4 py-3">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((r) => r.totalDebito !== 0 || r.totalCredito !== 0)
              .map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-neutral-700">{r.code}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{chartAccountTypeLabels[r.type]}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(r.totalDebito)}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(r.totalCredito)}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{formatCurrency(r.saldo)}</td>
                </tr>
              ))}
            {rows.every((r) => r.totalDebito === 0 && r.totalCredito === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum lançamento contábil ainda.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold text-neutral-800">
              <td className="px-4 py-3" colSpan={3}>
                Total Geral
              </td>
              <td className="px-4 py-3">{formatCurrency(totalGeralDebito)}</td>
              <td className="px-4 py-3">{formatCurrency(totalGeralCredito)}</td>
              <td className="px-4 py-3">
                {Math.abs(totalGeralDebito - totalGeralCredito) < 0.01 ? "Fechado" : "Não fechado"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
