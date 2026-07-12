import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/labels";
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from "lucide-react";

export default async function FluxoCaixaPage() {
  const entries = await prisma.financeEntry.findMany({
    orderBy: { dueDate: "asc" },
  });

  const paid = entries
    .filter((e) => e.status === "PAGO" && e.paymentDate)
    .sort((a, b) => new Date(a.paymentDate!).getTime() - new Date(b.paymentDate!).getTime());

  let running = 0;
  const withBalance = paid.map((e) => {
    running += e.type === "RECEBER" ? Number(e.amount) : -Number(e.amount);
    return { ...e, balance: running };
  });

  const pendingReceivable = entries
    .filter((e) => e.type === "RECEBER" && (e.status === "PENDENTE" || e.status === "ATRASADO"))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingPayable = entries
    .filter((e) => e.type === "PAGAR" && (e.status === "PENDENTE" || e.status === "ATRASADO"))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const saldoAtual = running;
  const saldoProjetado = saldoAtual + pendingReceivable - pendingPayable;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Fluxo de Caixa</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">Saldo Atual</p>
            <Wallet size={18} className="text-brand-700" />
          </div>
          <p className={`mt-3 text-2xl font-semibold ${saldoAtual >= 0 ? "text-neutral-900" : "text-red-600"}`}>
            {formatCurrency(saldoAtual)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">A Receber (pendente)</p>
            <TrendingUp size={18} className="text-green-700" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-900">{formatCurrency(pendingReceivable)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">A Pagar (pendente)</p>
            <TrendingDown size={18} className="text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-900">{formatCurrency(pendingPayable)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">Saldo Projetado</p>
            <ArrowRightLeft size={18} className="text-neutral-500" />
          </div>
          <p className={`mt-3 text-2xl font-semibold ${saldoProjetado >= 0 ? "text-neutral-900" : "text-red-600"}`}>
            {formatCurrency(saldoProjetado)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-700">Movimentações Realizadas</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {withBalance.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma movimentação realizada ainda.
                </td>
              </tr>
            )}
            {withBalance.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(e.paymentDate)}</td>
                <td className="px-4 py-3 text-neutral-700">{e.description}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.type === "RECEBER" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {e.type === "RECEBER" ? "Entrada" : "Saída"}
                  </span>
                </td>
                <td className={`px-4 py-3 ${e.type === "RECEBER" ? "text-green-700" : "text-red-600"}`}>
                  {e.type === "RECEBER" ? "+" : "-"}
                  {formatCurrency(e.amount)}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-800">{formatCurrency(e.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
