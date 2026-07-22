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
