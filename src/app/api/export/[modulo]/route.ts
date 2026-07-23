import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { toCsv, toXlsxBuffer, type ExportColumn } from "@/lib/export";
import { formatCurrency, formatDate } from "@/lib/labels";

type Dataset<T> = { rows: T[]; columns: ExportColumn<T>[]; filename: string; sheetName: string };

function buildDataset<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string
): Dataset<unknown> {
  return { rows, columns, filename, sheetName } as Dataset<unknown>;
}

async function getDataset(modulo: string, organizationId: string): Promise<Dataset<unknown> | null> {
  switch (modulo) {
    case "contas-pagar": {
      const rows = await prisma.financeEntry.findMany({
        where: { type: "PAGAR", organizationId },
        orderBy: { dueDate: "asc" },
        include: { supplier: true, costCenter: true },
      });
      return buildDataset(
        rows,
        [
          { key: "dueDate", label: "Vencimento", value: (r) => formatDate(r.dueDate) },
          { key: "description", label: "Descrição", value: (r) => r.description },
          { key: "supplier", label: "Fornecedor", value: (r) => r.supplier?.name ?? "" },
          { key: "costCenter", label: "Centro de Custo", value: (r) => r.costCenter?.name ?? "" },
          { key: "amount", label: "Valor", value: (r) => formatCurrency(r.amount) },
          { key: "status", label: "Status", value: (r) => r.status },
        ],
        "contas-a-pagar",
        "Contas a Pagar"
      );
    }
    case "contas-receber": {
      const rows = await prisma.financeEntry.findMany({
        where: { type: "RECEBER", organizationId },
        orderBy: { dueDate: "asc" },
        include: { client: true, costCenter: true },
      });
      return buildDataset(
        rows,
        [
          { key: "dueDate", label: "Vencimento", value: (r) => formatDate(r.dueDate) },
          { key: "description", label: "Descrição", value: (r) => r.description },
          { key: "client", label: "Cliente", value: (r) => r.client?.name ?? "" },
          { key: "costCenter", label: "Centro de Custo", value: (r) => r.costCenter?.name ?? "" },
          { key: "amount", label: "Valor", value: (r) => formatCurrency(r.amount) },
          { key: "status", label: "Status", value: (r) => r.status },
        ],
        "contas-a-receber",
        "Contas a Receber"
      );
    }
    case "lancamentos": {
      const rows = await prisma.journalEntry.findMany({
        where: { organizationId },
        orderBy: { date: "desc" },
        include: { lines: { include: { account: true } } },
      });
      return buildDataset(
        rows,
        [
          { key: "number", label: "Nº", value: (r) => r.number },
          { key: "date", label: "Data", value: (r) => formatDate(r.date) },
          { key: "description", label: "Descrição", value: (r) => r.description },
          {
            key: "debito",
            label: "Débito",
            value: (r) =>
              formatCurrency(
                r.lines
                  .filter((l) => l.type === "DEBITO")
                  .reduce((s, l) => s + Number(l.amount), 0)
              ),
          },
          {
            key: "credito",
            label: "Crédito",
            value: (r) =>
              formatCurrency(
                r.lines
                  .filter((l) => l.type === "CREDITO")
                  .reduce((s, l) => s + Number(l.amount), 0)
              ),
          },
          {
            key: "contas",
            label: "Contas",
            value: (r) => r.lines.map((l) => l.account.code).join(", "),
          },
        ],
        "lancamentos-contabeis",
        "Lançamentos"
      );
    }
    case "talhoes": {
      const rows = await prisma.talhao.findMany({
        where: { organizationId },
        orderBy: { code: "asc" },
      });
      return buildDataset(
        rows,
        [
          { key: "code", label: "Código", value: (r) => r.code },
          { key: "name", label: "Nome", value: (r) => r.name ?? "" },
          { key: "areaHectares", label: "Área (ha)", value: (r) => (r.areaHectares ? Number(r.areaHectares).toFixed(2) : "") },
          { key: "soilType", label: "Tipo de solo", value: (r) => r.soilType ?? "" },
        ],
        "talhoes",
        "Talhões"
      );
    }
    case "safras": {
      const rows = await prisma.safra.findMany({
        where: { talhao: { organizationId } },
        orderBy: { dataInicio: "desc" },
        include: { talhao: true },
      });
      return buildDataset(
        rows,
        [
          { key: "name", label: "Safra", value: (r) => r.name },
          { key: "talhao", label: "Talhão", value: (r) => r.talhao.code },
          { key: "cultura", label: "Cultura", value: (r) => r.cultura },
          { key: "dataInicio", label: "Início", value: (r) => (r.dataInicio ? formatDate(r.dataInicio) : "") },
          { key: "dataFimPrevista", label: "Fim previsto", value: (r) => (r.dataFimPrevista ? formatDate(r.dataFimPrevista) : "") },
          { key: "status", label: "Status", value: (r) => r.status },
        ],
        "safras",
        "Safras"
      );
    }
    case "colheita": {
      const rows = await prisma.harvest.findMany({
        where: { safra: { talhao: { organizationId } } },
        orderBy: { date: "desc" },
        include: { safra: { include: { talhao: true } } },
      });
      return buildDataset(
        rows,
        [
          { key: "date", label: "Data", value: (r) => formatDate(r.date) },
          { key: "safra", label: "Safra", value: (r) => r.safra.name },
          { key: "talhao", label: "Talhão", value: (r) => r.safra.talhao.code },
          { key: "producaoKg", label: "Produção (kg)", value: (r) => (r.producaoKg ? Number(r.producaoKg).toFixed(2) : "") },
          { key: "umidade", label: "Umidade (%)", value: (r) => (r.umidade ? Number(r.umidade).toFixed(2) : "") },
          { key: "qualidade", label: "Qualidade", value: (r) => r.qualidade ?? "" },
        ],
        "colheita",
        "Colheita"
      );
    }
    case "armazenagem": {
      const rows = await prisma.storage.findMany({
        where: { organizationId },
        orderBy: { code: "asc" },
        include: { movements: true },
      });
      return buildDataset(
        rows,
        [
          { key: "code", label: "Código", value: (r) => r.code },
          { key: "name", label: "Nome", value: (r) => r.name ?? "" },
          { key: "type", label: "Tipo", value: (r) => r.type },
          { key: "capacityTon", label: "Capacidade (t)", value: (r) => (r.capacityTon ? Number(r.capacityTon).toFixed(2) : "") },
          {
            key: "stock",
            label: "Estoque atual (t)",
            value: (r) =>
              r.movements
                .reduce((sum, m) => (m.type === "ENTRADA" ? sum + Number(m.quantityTon) : sum - Number(m.quantityTon)), 0)
                .toFixed(2),
          },
        ],
        "armazenagem",
        "Armazenagem"
      );
    }
    case "cadastro-animal": {
      const rows = await prisma.livestockAnimal.findMany({
        where: { organizationId },
        orderBy: { brinco: "asc" },
      });
      return buildDataset(
        rows,
        [
          { key: "brinco", label: "Brinco", value: (r) => r.brinco },
          { key: "name", label: "Nome", value: (r) => r.name ?? "" },
          { key: "category", label: "Categoria", value: (r) => r.category },
          { key: "sexo", label: "Sexo", value: (r) => r.sexo ?? "" },
          { key: "raca", label: "Raça", value: (r) => r.raca ?? "" },
          { key: "pesoAtual", label: "Peso atual (kg)", value: (r) => (r.pesoAtual ? Number(r.pesoAtual).toFixed(2) : "") },
          { key: "status", label: "Status", value: (r) => r.status },
        ],
        "cadastro-animal",
        "Cadastro Animal"
      );
    }
    case "pesagens": {
      const rows = await prisma.weightRecord.findMany({
        where: { animal: { organizationId } },
        orderBy: { date: "desc" },
        include: { animal: true },
      });
      return buildDataset(
        rows,
        [
          { key: "date", label: "Data", value: (r) => formatDate(r.date) },
          { key: "animal", label: "Animal", value: (r) => `${r.animal.brinco}${r.animal.name ? ` — ${r.animal.name}` : ""}` },
          { key: "weightKg", label: "Peso (kg)", value: (r) => Number(r.weightKg).toFixed(2) },
        ],
        "pesagens",
        "Pesagens"
      );
    }
    case "sanidade": {
      const rows = await prisma.healthRecord.findMany({
        where: { animal: { organizationId } },
        orderBy: { date: "desc" },
        include: { animal: true },
      });
      return buildDataset(
        rows,
        [
          { key: "date", label: "Data", value: (r) => formatDate(r.date) },
          { key: "animal", label: "Animal", value: (r) => `${r.animal.brinco}${r.animal.name ? ` — ${r.animal.name}` : ""}` },
          { key: "type", label: "Tipo", value: (r) => r.type },
          { key: "product", label: "Produto", value: (r) => r.product ?? "" },
          { key: "nextDoseDate", label: "Próxima dose", value: (r) => (r.nextDoseDate ? formatDate(r.nextDoseDate) : "") },
        ],
        "sanidade",
        "Sanidade"
      );
    }
    case "producao-leite": {
      const rows = await prisma.milkProduction.findMany({
        where: { animal: { organizationId } },
        orderBy: { date: "desc" },
        include: { animal: true },
      });
      return buildDataset(
        rows,
        [
          { key: "date", label: "Data", value: (r) => formatDate(r.date) },
          { key: "animal", label: "Animal", value: (r) => `${r.animal.brinco}${r.animal.name ? ` — ${r.animal.name}` : ""}` },
          { key: "shift", label: "Turno", value: (r) => r.shift ?? "" },
          { key: "liters", label: "Litros", value: (r) => Number(r.liters).toFixed(2) },
          { key: "ccs", label: "CCS", value: (r) => (r.ccs ? Number(r.ccs).toFixed(2) : "") },
          { key: "cbt", label: "CBT", value: (r) => (r.cbt ? Number(r.cbt).toFixed(2) : "") },
        ],
        "producao-leite",
        "Produção de Leite"
      );
    }
    case "materiais": {
      const rows = await prisma.stockItem.findMany({
        where: { organizationId },
        orderBy: { code: "asc" },
      });
      return buildDataset(
        rows,
        [
          { key: "code", label: "Código", value: (r) => r.code },
          { key: "name", label: "Nome", value: (r) => r.name },
          { key: "category", label: "Categoria", value: (r) => r.category },
          { key: "unit", label: "Unidade", value: (r) => r.unit ?? "" },
          { key: "currentQuantity", label: "Quantidade atual", value: (r) => Number(r.currentQuantity).toFixed(2) },
          { key: "minQuantity", label: "Quantidade mínima", value: (r) => (r.minQuantity ? Number(r.minQuantity).toFixed(2) : "") },
        ],
        "materiais",
        "Materiais"
      );
    }
    case "lotes": {
      const rows = await prisma.stockBatch.findMany({
        where: { stockItem: { organizationId } },
        orderBy: { entryDate: "desc" },
        include: { stockItem: true },
      });
      return buildDataset(
        rows,
        [
          { key: "stockItem", label: "Material", value: (r) => r.stockItem.name },
          { key: "batchNumber", label: "Lote", value: (r) => r.batchNumber ?? "" },
          { key: "quantity", label: "Quantidade", value: (r) => Number(r.quantity).toFixed(2) },
          { key: "entryDate", label: "Entrada", value: (r) => formatDate(r.entryDate) },
          { key: "expiryDate", label: "Validade", value: (r) => (r.expiryDate ? formatDate(r.expiryDate) : "") },
          { key: "status", label: "Status", value: (r) => r.status },
        ],
        "lotes",
        "Lotes"
      );
    }
    default:
      return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ modulo: string }> }
) {
  const { organizationId } = await requireOrg();
  const { modulo } = await params;
  const format = req.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const dataset = await getDataset(modulo, organizationId);
  if (!dataset) return NextResponse.json({ error: "Módulo de exportação inválido." }, { status: 404 });

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer(dataset.rows, dataset.columns, dataset.sheetName);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${dataset.filename}.xlsx"`,
      },
    });
  }

  const csv = toCsv(dataset.rows, dataset.columns);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dataset.filename}.csv"`,
    },
  });
}
