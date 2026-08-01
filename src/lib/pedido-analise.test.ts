import { describe, it, expect } from "vitest";
import { calcularValorTotal } from "./pedido-analise";

describe("calcularValorTotal", () => {
  it("sums the value of every item", () => {
    expect(calcularValorTotal([{ valor: 100 }, { valor: 50 }, { valor: 25.5 }])).toBe(175.5);
  });

  it("returns 0 for an empty list of items", () => {
    expect(calcularValorTotal([])).toBe(0);
  });

  it("treats items with a missing or null valor as 0", () => {
    expect(calcularValorTotal([{ valor: 100 }, { valor: null }, { valor: undefined }])).toBe(100);
  });

  it("coerces string values (as Prisma Decimal fields arrive) into numbers", () => {
    expect(calcularValorTotal([{ valor: "40.50" }, { valor: "9.50" }])).toBe(50);
  });
});
