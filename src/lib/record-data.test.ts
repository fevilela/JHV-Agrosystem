import { describe, it, expect } from "vitest";
import { buildRecordData } from "./record-data";
import type { RecordField } from "@/components/crud/record-form";

function formData(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.set(key, value);
  return fd;
}

describe("buildRecordData", () => {
  it("trims text fields and converts blank strings to null", () => {
    const fields: RecordField[] = [{ name: "name", label: "Nome", type: "text" }];
    expect(buildRecordData(fields, formData({ name: "  Fazenda São João  " }))).toEqual({
      name: "Fazenda São João",
    });
    expect(buildRecordData(fields, formData({ name: "   " }))).toEqual({ name: null });
    expect(buildRecordData(fields, new FormData())).toEqual({ name: null });
  });

  it("parses number fields", () => {
    const fields: RecordField[] = [{ name: "weightKg", label: "Peso", type: "number" }];
    expect(buildRecordData(fields, formData({ weightKg: "412.5" }))).toEqual({ weightKg: 412.5 });
  });

  it("parses date fields into Date objects", () => {
    const fields: RecordField[] = [{ name: "date", label: "Data", type: "date" }];
    const result = buildRecordData(fields, formData({ date: "2026-07-22" }));
    expect(result.date).toBeInstanceOf(Date);
    expect((result.date as Date).toISOString().slice(0, 10)).toBe("2026-07-22");
  });

  it("treats checkbox 'on' as true and a missing checkbox as false", () => {
    const fields: RecordField[] = [{ name: "active", label: "Ativo", type: "checkbox" }];
    expect(buildRecordData(fields, formData({ active: "on" }))).toEqual({ active: true });
    expect(buildRecordData(fields, new FormData())).toEqual({ active: false });
  });
});
