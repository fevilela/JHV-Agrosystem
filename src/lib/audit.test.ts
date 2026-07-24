import { describe, it, expect } from "vitest";
import { diffRecords } from "./audit";

describe("diffRecords", () => {
  it("reports no changes when before and after are identical", () => {
    expect(diffRecords({ name: "Fazenda São João" }, { name: "Fazenda São João" })).toEqual([]);
  });

  it("does not treat null and undefined as different (normalizes both to null)", () => {
    // Regression test: before Fase 3's fix, JSON.stringify(undefined) !==
    // JSON.stringify(null), so every unset field on a CREATE looked "changed".
    expect(diffRecords({ cpfCnpj: undefined }, { cpfCnpj: null })).toEqual([]);
    expect(diffRecords(undefined, { cpfCnpj: null })).toEqual([]);
  });

  it("ignores id, organizationId, createdAt and updatedAt", () => {
    const before = { id: "1", organizationId: "org1", createdAt: new Date(2020, 0, 1) };
    const after = { id: "2", organizationId: "org2", createdAt: new Date(2026, 0, 1) };
    expect(diffRecords(before, after)).toEqual([]);
  });

  it("reports a changed field with its before/after values", () => {
    const changes = diffRecords({ status: "PENDENTE" }, { status: "PAGO" });
    expect(changes).toEqual([{ field: "status", before: "PENDENTE", after: "PAGO" }]);
  });

  it("compares Date values by their ISO string, not object identity", () => {
    const same = new Date("2026-07-22T00:00:00.000Z");
    expect(diffRecords({ date: same }, { date: new Date(same.getTime()) })).toEqual([]);

    const changed = diffRecords(
      { date: new Date("2026-07-22T00:00:00.000Z") },
      { date: new Date("2026-07-23T00:00:00.000Z") }
    );
    expect(changed).toHaveLength(1);
    expect(changed[0].field).toBe("date");
  });

  it("includes fields only present on one side", () => {
    expect(diffRecords({}, { notes: "novo campo" })).toEqual([
      { field: "notes", before: null, after: "novo campo" },
    ]);
  });
});
