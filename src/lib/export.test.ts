import { describe, it, expect } from "vitest";
import { toCsv, type ExportColumn } from "./export";

type Row = { name: string; amount: number | null };

const columns: ExportColumn<Row>[] = [
  { key: "name", label: "Nome", value: (r) => r.name },
  { key: "amount", label: "Valor", value: (r) => r.amount },
];

describe("toCsv", () => {
  it("starts with a BOM so accented characters open correctly in Excel", () => {
    const csv = toCsv<Row>([], columns);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("joins the header with the configured labels", () => {
    const csv = toCsv<Row>([], columns);
    expect(csv).toContain("Nome;Valor");
  });

  it("renders null/undefined values as an empty cell", () => {
    const csv = toCsv<Row>([{ name: "Ração", amount: null }], columns);
    const lines = csv.split("\r\n");
    expect(lines[1]).toBe("Ração;");
  });

  it("quotes and escapes values containing the delimiter or quotes", () => {
    const csv = toCsv<Row>([{ name: 'Milho, "safra 2026"', amount: 10 }], columns);
    const lines = csv.split("\r\n");
    expect(lines[1]).toBe('"Milho, ""safra 2026"""' + ";10");
  });
});
