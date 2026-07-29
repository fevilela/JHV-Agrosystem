import type { FaseMuda } from "@prisma/client";

export const FASE_ORDER: FaseMuda[] = [
  "SEMEADURA_ESTAQUEAMENTO",
  "GERMINACAO_ENRAIZAMENTO",
  "REPICAGEM",
  "CRESCIMENTO",
  "RUSTIFICACAO",
  "PRONTA_EXPEDICAO",
];

export function nextFase(fase: FaseMuda): FaseMuda | null {
  const idx = FASE_ORDER.indexOf(fase);
  if (idx === -1 || idx === FASE_ORDER.length - 1) return null;
  return FASE_ORDER[idx + 1];
}

export function lossRate(quantidadeInicial: number, quantidadePerdida: number): number {
  if (!quantidadeInicial || quantidadeInicial <= 0) return 0;
  return (quantidadePerdida / quantidadeInicial) * 100;
}

export type FaseEventoLike = {
  fase: FaseMuda;
  quantidadePerdida?: number | null;
};

export function phaseLossRates(eventos: FaseEventoLike[], quantidadeInicial: number) {
  return eventos.map((e) => ({
    fase: e.fase,
    quantidadePerdida: e.quantidadePerdida ?? 0,
    taxaPerda: lossRate(quantidadeInicial, e.quantidadePerdida ?? 0),
  }));
}

export function totalLossRate(eventos: FaseEventoLike[], quantidadeInicial: number): number {
  const totalPerdida = eventos.reduce((sum, e) => sum + (e.quantidadePerdida ?? 0), 0);
  return lossRate(quantidadeInicial, totalPerdida);
}

// Pure planning function for the "avançar fase" flow: given the currently-open
// event and how much was lost in it, decides how to close it and what the next
// event should look like. `now` is passed in (not read internally) so this stays
// a pure function the Server Action can wrap with the real Prisma writes.
export function buildAdvancePhasePayload(
  currentEvent: { id: string; fase: FaseMuda },
  quantidadePerdida: number | null | undefined,
  now: Date
) {
  const proximaFase = nextFase(currentEvent.fase);
  if (!proximaFase) return null;

  return {
    closePrevious: {
      id: currentEvent.id,
      dataSaida: now,
      quantidadePerdida: quantidadePerdida ?? 0,
    },
    newEvent: {
      fase: proximaFase,
      dataEntrada: now,
    },
  };
}
