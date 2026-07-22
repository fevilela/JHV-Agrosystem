import ExcelJS from "exceljs";

export type ExportColumn<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCsvValue(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(";");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(c.value(row))).join(";")
  );
  // BOM pra abrir certo no Excel com acentos
  return "﻿" + [header, ...lines].join("\r\n");
}

export async function toXlsxBuffer<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  sheetName = "Dados"
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow(Object.fromEntries(columns.map((c) => [c.key, c.value(row)])));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
