import { describe, it, expect } from "vitest";
import {
  nextFase,
  lossRate,
  phaseLossRates,
  totalLossRate,
  buildAdvancePhasePayload,
} from "./muda-lote";

describe("nextFase", () => {
  it("advances through the phase order in sequence", () => {
    expect(nextFase("SEMEADURA_ESTAQUEAMENTO")).toBe("GERMINACAO_ENRAIZAMENTO");
    expect(nextFase("GERMINACAO_ENRAIZAMENTO")).toBe("REPICAGEM");
    expect(nextFase("REPICAGEM")).toBe("CRESCIMENTO");
    expect(nextFase("CRESCIMENTO")).toBe("RUSTIFICACAO");
    expect(nextFase("RUSTIFICACAO")).toBe("PRONTA_EXPEDICAO");
  });

  it("returns null once the last phase is reached", () => {
    expect(nextFase("PRONTA_EXPEDICAO")).toBeNull();
  });
});

describe("lossRate", () => {
  it("computes the percentage lost relative to the initial quantity", () => {
    expect(lossRate(100, 10)).toBe(10);
    expect(lossRate(200, 50)).toBe(25);
  });

  it("returns 0 when nothing was lost", () => {
    expect(lossRate(100, 0)).toBe(0);
  });

  it("returns 0 when the initial quantity is 0 or negative (avoids division by zero)", () => {
    expect(lossRate(0, 10)).toBe(0);
    expect(lossRate(-5, 10)).toBe(0);
  });
});

describe("phaseLossRates", () => {
  it("maps each event to its own loss rate against the lote's initial quantity", () => {
    const eventos = [
      { fase: "SEMEADURA_ESTAQUEAMENTO" as const, quantidadePerdida: 10 },
      { fase: "GERMINACAO_ENRAIZAMENTO" as const, quantidadePerdida: 5 },
    ];
    expect(phaseLossRates(eventos, 100)).toEqual([
      { fase: "SEMEADURA_ESTAQUEAMENTO", quantidadePerdida: 10, taxaPerda: 10 },
      { fase: "GERMINACAO_ENRAIZAMENTO", quantidadePerdida: 5, taxaPerda: 5 },
    ]);
  });

  it("treats a missing/null quantidadePerdida as 0", () => {
    const eventos = [{ fase: "SEMEADURA_ESTAQUEAMENTO" as const, quantidadePerdida: null }];
    expect(phaseLossRates(eventos, 100)).toEqual([
      { fase: "SEMEADURA_ESTAQUEAMENTO", quantidadePerdida: 0, taxaPerda: 0 },
    ]);
  });
});

describe("totalLossRate", () => {
  it("sums losses across every phase before computing the rate", () => {
    const eventos = [
      { fase: "SEMEADURA_ESTAQUEAMENTO" as const, quantidadePerdida: 10 },
      { fase: "GERMINACAO_ENRAIZAMENTO" as const, quantidadePerdida: 15 },
      { fase: "REPICAGEM" as const, quantidadePerdida: 0 },
    ];
    expect(totalLossRate(eventos, 100)).toBe(25);
  });

  it("returns 0 for a lote with no recorded losses", () => {
    const eventos = [{ fase: "SEMEADURA_ESTAQUEAMENTO" as const, quantidadePerdida: 0 }];
    expect(totalLossRate(eventos, 100)).toBe(0);
  });
});

describe("buildAdvancePhasePayload", () => {
  const now = new Date("2026-07-29T12:00:00.000Z");

  it("closes the current event and opens the next phase's event", () => {
    const current = { id: "evt-1", fase: "SEMEADURA_ESTAQUEAMENTO" as const };
    const payload = buildAdvancePhasePayload(current, 3, now);
    expect(payload).toEqual({
      closePrevious: { id: "evt-1", dataSaida: now, quantidadePerdida: 3 },
      newEvent: { fase: "GERMINACAO_ENRAIZAMENTO", dataEntrada: now },
    });
  });

  it("defaults quantidadePerdida to 0 when not informed", () => {
    const current = { id: "evt-2", fase: "CRESCIMENTO" as const };
    const payload = buildAdvancePhasePayload(current, undefined, now);
    expect(payload?.closePrevious.quantidadePerdida).toBe(0);
  });

  it("returns null when the lote is already at the last phase (nothing to advance to)", () => {
    const current = { id: "evt-3", fase: "PRONTA_EXPEDICAO" as const };
    expect(buildAdvancePhasePayload(current, 0, now)).toBeNull();
  });
});
