import { describe, it, expect } from "vitest";
import { calcularValorTotalPedidoVenda, validarItensParaConfirmacao } from "./muda-pedido-venda";

describe("calcularValorTotalPedidoVenda", () => {
  it("sums quantidade * precoUnitario across every item", () => {
    const itens = [
      { quantidade: 10, precoUnitario: 2.5 },
      { quantidade: 4, precoUnitario: 3 },
    ];
    expect(calcularValorTotalPedidoVenda(itens)).toBe(37);
  });

  it("returns 0 for an empty list of items", () => {
    expect(calcularValorTotalPedidoVenda([])).toBe(0);
  });

  it("coerces string values (as Prisma Decimal/Int fields arrive) into numbers", () => {
    expect(calcularValorTotalPedidoVenda([{ quantidade: "10", precoUnitario: "2.50" }])).toBe(25);
  });
});

describe("validarItensParaConfirmacao", () => {
  it("is ok when every item's quantity fits within the lote's current stock", () => {
    const itens = [
      { loteId: "l1", loteCode: "L-001", quantidade: 10, loteQuantidadeAtual: 10 },
      { loteId: "l2", loteCode: "L-002", quantidade: 5, loteQuantidadeAtual: 20 },
    ];
    expect(validarItensParaConfirmacao(itens)).toEqual({ ok: true });
  });

  it("blocks confirmation and names the offending lote when quantity exceeds stock", () => {
    const itens = [
      { loteId: "l1", loteCode: "L-001", quantidade: 10, loteQuantidadeAtual: 10 },
      { loteId: "l2", loteCode: "L-002", quantidade: 15, loteQuantidadeAtual: 12 },
    ];
    const result = validarItensParaConfirmacao(itens);
    expect(result.ok).toBe(false);
    expect(result).toEqual(
      expect.objectContaining({ error: expect.stringContaining("L-002") })
    );
  });
});
