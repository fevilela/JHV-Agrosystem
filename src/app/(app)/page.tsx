import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import Link from "next/link";
import { AlertTriangle, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/labels";
import { getPendencias } from "@/lib/pendencias";
import { PendenciasByCategoryChart } from "@/components/dashboard/pendencias-by-category-chart";
import { CashFlowTrendChart } from "@/components/dashboard/cash-flow-trend-chart";

const categoryColor: Record<string, string> = {
  "Contas a Pagar": "bg-red-50 text-red-700",
  "Contas a Receber": "bg-green-50 text-green-700",
  Estoque: "bg-amber-50 text-amber-700",
  "Lote de Estoque": "bg-amber-50 text-amber-700",
  Manutenção: "bg-purple-50 text-purple-700",
  Treinamento: "bg-blue-50 text-blue-700",
  EPI: "bg-blue-50 text-blue-700",
  "Sanidade Hípica": "bg-teal-50 text-teal-700",
  "Sanidade Pecuária": "bg-teal-50 text-teal-700",
};

export default async function DashboardPage() {
  const session = await auth();
  const { organizationId } = await requireOrg();

  const pendencias = await getPendencias(organizationId);
  const paidEntries = await prisma.financeEntry.findMany({
    where: { organizationId, status: "PAGO", paymentDate: { not: null } },
    orderBy: { paymentDate: "asc" },
    take: 200,
  });

  const totalPagarAtrasado = pendencias
    .filter((p) => p.category === "Contas a Pagar" && p.severity === "vencido")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalReceberAtrasado = pendencias
    .filter((p) => p.category === "Contas a Receber" && p.severity === "vencido")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const vencidos = pendencias.filter((p) => p.severity === "vencido").length;
  const vencendo = pendencias.filter((p) => p.severity === "vencendo").length;

  const pendenciasByCategoryMap = new Map<string, number>();
  for (const p of pendencias) {
    pendenciasByCategoryMap.set(p.category, (pendenciasByCategoryMap.get(p.category) ?? 0) + 1);
  }
  const pendenciasByCategory = [...pendenciasByCategoryMap.entries()].map(([category, count]) => ({
    category,
    count,
  }));

  const dailyNet = new Map<string, number>();
  for (const e of paidEntries) {
    const key = new Date(e.paymentDate!).toISOString().slice(0, 10);
    const delta = e.type === "RECEBER" ? Number(e.amount) : -Number(e.amount);
    dailyNet.set(key, (dailyNet.get(key) ?? 0) + delta);
  }
  let runningBalance = 0;
  const cashFlowTrend = [...dailyNet.keys()].sort().map((date) => {
    runningBalance += dailyNet.get(date)!;
    return { date, balance: runningBalance };
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">
        Olá, {session?.user?.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Alertas e pendências do JHV Agrosystem
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">A Pagar em Atraso</p>
            <TrendingDown size={18} className="text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-900">
            {formatCurrency(totalPagarAtrasado)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">A Receber em Atraso</p>
            <TrendingUp size={18} className="text-green-700" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-900">
            {formatCurrency(totalReceberAtrasado)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">Pendências Vencidas</p>
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-900">{vencidos}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">Vencendo em Breve</p>
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-neutral-900">{vencendo}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Pendências por Categoria</h2>
          {pendenciasByCategory.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400">Nenhuma pendência no momento.</p>
          ) : (
            <PendenciasByCategoryChart data={pendenciasByCategory} />
          )}
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Evolução do Fluxo de Caixa</h2>
          {cashFlowTrend.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400">Sem movimentações pagas ainda.</p>
          ) : (
            <CashFlowTrendChart data={cashFlowTrend} />
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-700">
            Pendências ({pendencias.length})
          </h2>
        </div>
        {pendencias.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-neutral-400">
            Nenhuma pendência no momento.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Detalhe</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendencias.map((p, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={p.href}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        categoryColor[p.category] || "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {p.category}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{p.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.detail || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.date ? formatDate(p.date) : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.severity === "vencido"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.severity === "vencido" ? "Vencido" : "Vencendo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
