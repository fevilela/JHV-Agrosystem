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

// Usada ao registrar consumo de insumo (MudaLoteInsumo) — StockItem.currentQuantity nunca
// pode ficar negativo silenciosamente.
export function hasSufficientStock(currentQuantity: number, quantidadeSolicitada: number): boolean {
  return quantidadeSolicitada <= currentQuantity;
}

// Um lote só está "disponível pra venda" quando chegou na última fase e ainda sobra
// quantidade — usada tanto pra listar o estoque de mudas prontas quanto pra validar item
// de pedido de venda (só permite vender lote nessa condição).
export function loteDisponivelParaVenda(faseAtual: FaseMuda, quantidadeAtual: number): boolean {
  return faseAtual === "PRONTA_EXPEDICAO" && quantidadeAtual > 0;
}

export type InsumoCustoLike = { quantidade: number | string; unitCost: number | string | null };
export type MaoDeObraCustoLike = {
  horasTrabalhadas: number | string;
  custoHora: number | string | null;
};

// Agrega o custo de um lote a partir dos insumos consumidos e da mão de obra apontada
// (fase 2). `completo: false` sinaliza que pelo menos um lançamento não tinha custo
// informado — nesse caso o custoTotal é parcial, não deve ser tratado como exato.
export function calcularCustoLote(insumos: InsumoCustoLike[], maoDeObra: MaoDeObraCustoLike[]) {
  let custoInsumos = 0;
  let completo = true;

  for (const i of insumos) {
    if (i.unitCost === null || i.unitCost === undefined) {
      completo = false;
      continue;
    }
    custoInsumos += Number(i.quantidade) * Number(i.unitCost);
  }

  let custoMaoDeObra = 0;
  for (const m of maoDeObra) {
    if (m.custoHora === null || m.custoHora === undefined) {
      completo = false;
      continue;
    }
    custoMaoDeObra += Number(m.horasTrabalhadas) * Number(m.custoHora);
  }

  return {
    custoInsumos,
    custoMaoDeObra,
    custoTotal: custoInsumos + custoMaoDeObra,
    completo,
  };
}

// Custo por muda usa quantidadeInicial (não quantidadeAtual) pra não distorcer o valor
// unitário conforme perdas/vendas vão acontecendo ao longo do ciclo.
export function custoPorMuda(custoTotal: number, quantidadeInicial: number): number | null {
  if (!quantidadeInicial || quantidadeInicial <= 0) return null;
  return custoTotal / quantidadeInicial;
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
