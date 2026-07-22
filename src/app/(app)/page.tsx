import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import Link from "next/link";
import { AlertTriangle, Clock, TrendingDown, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  equineHealthRecordTypeLabels,
  healthRecordTypeLabels,
  maintenanceTypeLabels,
} from "@/lib/labels";

type Pendencia = {
  category: string;
  title: string;
  detail?: string;
  date: Date | null;
  severity: "vencido" | "vencendo";
  href: string;
};

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
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Consultas sequenciais (não Promise.all) para não estourar o pool de
  // conexões do Supabase quando várias sessões usam o mesmo banco.
  const contasPagar = await prisma.financeEntry.findMany({
    where: { type: "PAGAR", status: "PENDENTE", dueDate: { lte: in7 }, organizationId },
    include: { supplier: true },
  });
  const contasReceber = await prisma.financeEntry.findMany({
    where: { type: "RECEBER", status: "PENDENTE", dueDate: { lte: in7 }, organizationId },
    include: { client: true },
  });
  const materiais = await prisma.stockItem.findMany({
    where: { minQuantity: { not: null }, organizationId },
  });
  const lotes = await prisma.stockBatch.findMany({
    where: { status: "DISPONIVEL", expiryDate: { lte: in30 }, stockItem: { organizationId } },
    include: { stockItem: true },
  });
  const manutencoes = await prisma.maintenance.findMany({
    where: { nextDueDate: { lte: in7 }, machine: { organizationId } },
    include: { machine: true },
  });
  const treinamentos = await prisma.training.findMany({
    where: { validUntil: { lte: in30 }, employee: { organizationId } },
    include: { employee: true },
  });
  const epis = await prisma.epiIssuance.findMany({
    where: { validUntil: { lte: in30 }, employee: { organizationId } },
    include: { employee: true },
  });
  const sanidadeHipica = await prisma.equineHealthRecord.findMany({
    where: { organizationId, nextDoseDate: { lte: in30 } },
    include: { animal: true },
  });
  const sanidadePecuaria = await prisma.healthRecord.findMany({
    where: { nextDoseDate: { lte: in30 }, animal: { organizationId } },
    include: { animal: true },
  });

  const pendencias: Pendencia[] = [];

  for (const e of contasPagar) {
    pendencias.push({
      category: "Contas a Pagar",
      title: e.supplier?.name || e.description,
      detail: formatCurrency(e.amount),
      date: e.dueDate,
      severity: new Date(e.dueDate) < now ? "vencido" : "vencendo",
      href: "/financeiro/contas-pagar",
    });
  }

  for (const e of contasReceber) {
    pendencias.push({
      category: "Contas a Receber",
      title: e.client?.name || e.description,
      detail: formatCurrency(e.amount),
      date: e.dueDate,
      severity: new Date(e.dueDate) < now ? "vencido" : "vencendo",
      href: "/financeiro/contas-receber",
    });
  }

  for (const item of materiais) {
    if (item.minQuantity != null && Number(item.currentQuantity) < Number(item.minQuantity)) {
      pendencias.push({
        category: "Estoque",
        title: item.name,
        detail: `Estoque: ${item.currentQuantity}${item.unit ? ` ${item.unit}` : ""} (mínimo ${item.minQuantity})`,
        date: null,
        severity: "vencido",
        href: "/estoque/materiais",
      });
    }
  }

  for (const b of lotes) {
    pendencias.push({
      category: "Lote de Estoque",
      title: `${b.stockItem.name}${b.batchNumber ? ` — Lote ${b.batchNumber}` : ""}`,
      date: b.expiryDate,
      severity: new Date(b.expiryDate!) < now ? "vencido" : "vencendo",
      href: "/estoque/lotes",
    });
  }

  for (const m of manutencoes) {
    const maquina =
      [m.machine.brand, m.machine.model].filter(Boolean).join(" ") ||
      m.machine.plateOrSerial ||
      "Máquina";
    pendencias.push({
      category: "Manutenção",
      title: maquina,
      detail: maintenanceTypeLabels[m.type],
      date: m.nextDueDate,
      severity: new Date(m.nextDueDate!) < now ? "vencido" : "vencendo",
      href: "/maquinas/manutencoes",
    });
  }

  for (const t of treinamentos) {
    pendencias.push({
      category: "Treinamento",
      title: `${t.employee.name} — ${t.name}`,
      date: t.validUntil,
      severity: new Date(t.validUntil!) < now ? "vencido" : "vencendo",
      href: "/rh/treinamentos",
    });
  }

  for (const i of epis) {
    pendencias.push({
      category: "EPI",
      title: `${i.employee.name} — ${i.itemName}`,
      date: i.validUntil,
      severity: new Date(i.validUntil!) < now ? "vencido" : "vencendo",
      href: "/rh/treinamentos/epis",
    });
  }

  for (const r of sanidadeHipica) {
    pendencias.push({
      category: "Sanidade Hípica",
      title: `${r.animal.name} — ${equineHealthRecordTypeLabels[r.type]}`,
      date: r.nextDoseDate,
      severity: new Date(r.nextDoseDate!) < now ? "vencido" : "vencendo",
      href: "/hipica/sanidade",
    });
  }

  for (const r of sanidadePecuaria) {
    pendencias.push({
      category: "Sanidade Pecuária",
      title: `${r.animal.brinco}${r.animal.name ? ` (${r.animal.name})` : ""} — ${healthRecordTypeLabels[r.type]}`,
      date: r.nextDoseDate,
      severity: new Date(r.nextDoseDate!) < now ? "vencido" : "vencendo",
      href: "/pecuaria/sanidade",
    });
  }

  pendencias.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "vencido" ? -1 : 1;
    const at = a.date ? a.date.getTime() : 0;
    const bt = b.date ? b.date.getTime() : 0;
    return at - bt;
  });

  const totalPagarAtrasado = contasPagar
    .filter((e) => new Date(e.dueDate) < now)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalReceberAtrasado = contasReceber
    .filter((e) => new Date(e.dueDate) < now)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const vencidos = pendencias.filter((p) => p.severity === "vencido").length;
  const vencendo = pendencias.filter((p) => p.severity === "vencendo").length;

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
