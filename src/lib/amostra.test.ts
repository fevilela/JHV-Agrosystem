import { describe, it, expect } from "vitest";
import { getStatusTransitions, isTerminalStatus } from "./amostra";

describe("getStatusTransitions", () => {
  it("allows a recém-recebida amostra to move to em análise or ser cancelada", () => {
    const transitions = getStatusTransitions("RECEBIDA");
    expect(transitions.map((t) => t.next)).toEqual(["EM_ANALISE", "CANCELADA"]);
  });

  it("allows an em-análise amostra to be concluída or cancelada", () => {
    const transitions = getStatusTransitions("EM_ANALISE");
    expect(transitions.map((t) => t.next)).toEqual(["CONCLUIDA", "CANCELADA"]);
  });

  it("returns no transitions for terminal states", () => {
    expect(getStatusTransitions("CONCLUIDA")).toEqual([]);
    expect(getStatusTransitions("CANCELADA")).toEqual([]);
  });
});

describe("isTerminalStatus", () => {
  it("treats CONCLUIDA and CANCELADA as terminal", () => {
    expect(isTerminalStatus("CONCLUIDA")).toBe(true);
    expect(isTerminalStatus("CANCELADA")).toBe(true);
  });

  it("treats RECEBIDA and EM_ANALISE as non-terminal", () => {
    expect(isTerminalStatus("RECEBIDA")).toBe(false);
    expect(isTerminalStatus("EM_ANALISE")).toBe(false);
  });
});
