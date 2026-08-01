import { describe, it, expect } from "vitest";
import { isPrazoVencido } from "./nao-conformidade";

describe("isPrazoVencido", () => {
  const now = new Date("2026-08-01T12:00:00.000Z");

  it("is vencido when the deadline already passed and the item isn't resolved", () => {
    expect(isPrazoVencido("2026-07-30", "ABERTA", now)).toBe(true);
    expect(isPrazoVencido("2026-07-30", "EM_TRATATIVA", now)).toBe(true);
  });

  it("is not vencido when the deadline is still in the future", () => {
    expect(isPrazoVencido("2026-08-15", "ABERTA", now)).toBe(false);
  });

  it("is never vencido once the item is marked RESOLVIDA, regardless of date", () => {
    expect(isPrazoVencido("2026-07-30", "RESOLVIDA", now)).toBe(false);
  });

  it("is not vencido when there's no deadline set", () => {
    expect(isPrazoVencido(null, "ABERTA", now)).toBe(false);
    expect(isPrazoVencido(undefined, "ABERTA", now)).toBe(false);
  });
});
