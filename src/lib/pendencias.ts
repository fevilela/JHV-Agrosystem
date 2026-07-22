import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  equineHealthRecordTypeLabels,
  healthRecordTypeLabels,
  maintenanceTypeLabels,
} from "@/lib/labels";

export type Pendencia = {
  id: string;
  category: string;
  title: string;
  detail?: string;
  amount?: number;
  date: Date | null;
  severity: "vencido" | "vencendo";
  href: string;
};

// Consultas sequenciais (não Promise.all) para não estourar o pool de
// conexões do Supabase quando várias sessões usam o mesmo banco.
export async function getPendencias(organizationId: string): Promise<Pendencia[]> {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const contasPagar = await prisma.financeEntry.findMany({
    where: {
      type: "PAGAR",
      status: { in: ["PENDENTE", "ATRASADO"] },
      dueDate: { lte: in7 },
      organizationId,
    },
    include: { supplier: true },
  });
  const contasReceber = await prisma.financeEntry.findMany({
    where: {
      type: "RECEBER",
      status: { in: ["PENDENTE", "ATRASADO"] },
      dueDate: { lte: in7 },
      organizationId,
    },
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
      id: `contas-pagar:${e.id}`,
      category: "Contas a Pagar",
      title: e.supplier?.name || e.description,
      detail: formatCurrency(e.amount),
      amount: Number(e.amount),
      date: e.dueDate,
      severity: new Date(e.dueDate) < now ? "vencido" : "vencendo",
      href: "/financeiro/contas-pagar",
    });
  }

  for (const e of contasReceber) {
    pendencias.push({
      id: `contas-receber:${e.id}`,
      category: "Contas a Receber",
      title: e.client?.name || e.description,
      detail: formatCurrency(e.amount),
      amount: Number(e.amount),
      date: e.dueDate,
      severity: new Date(e.dueDate) < now ? "vencido" : "vencendo",
      href: "/financeiro/contas-receber",
    });
  }

  for (const item of materiais) {
    if (item.minQuantity != null && Number(item.currentQuantity) < Number(item.minQuantity)) {
      pendencias.push({
        id: `estoque:${item.id}`,
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
      id: `lote-estoque:${b.id}`,
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
      id: `manutencao:${m.id}`,
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
      id: `treinamento:${t.id}`,
      category: "Treinamento",
      title: `${t.employee.name} — ${t.name}`,
      date: t.validUntil,
      severity: new Date(t.validUntil!) < now ? "vencido" : "vencendo",
      href: "/rh/treinamentos",
    });
  }

  for (const i of epis) {
    pendencias.push({
      id: `epi:${i.id}`,
      category: "EPI",
      title: `${i.employee.name} — ${i.itemName}`,
      date: i.validUntil,
      severity: new Date(i.validUntil!) < now ? "vencido" : "vencendo",
      href: "/rh/treinamentos/epis",
    });
  }

  for (const r of sanidadeHipica) {
    pendencias.push({
      id: `sanidade-hipica:${r.id}`,
      category: "Sanidade Hípica",
      title: `${r.animal.name} — ${equineHealthRecordTypeLabels[r.type]}`,
      date: r.nextDoseDate,
      severity: new Date(r.nextDoseDate!) < now ? "vencido" : "vencendo",
      href: "/hipica/sanidade",
    });
  }

  for (const r of sanidadePecuaria) {
    pendencias.push({
      id: `sanidade-pecuaria:${r.id}`,
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

  return pendencias;
}
