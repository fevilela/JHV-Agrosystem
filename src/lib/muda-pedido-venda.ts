export type PedidoItemLike = {
  quantidade: number | string;
  precoUnitario: number | string;
};

// Nunca deixar o usuário digitar valorTotal direto — sempre recalculado a partir dos itens.
export function calcularValorTotalPedidoVenda(itens: PedidoItemLike[]): number {
  return itens.reduce((sum, item) => sum + Number(item.quantidade) * Number(item.precoUnitario), 0);
}

export type ItemParaConfirmacao = {
  loteId: string;
  loteCode: string;
  quantidade: number;
  loteQuantidadeAtual: number;
};

export type ConfirmacaoResult = { ok: true } | { ok: false; error: string };

// Ao confirmar um pedido, cada item precisa caber no que ainda resta do lote na hora da
// confirmação (pode ter sido vendido/perdido depois que o item foi adicionado ao pedido).
export function validarItensParaConfirmacao(itens: ItemParaConfirmacao[]): ConfirmacaoResult {
  for (const item of itens) {
    if (item.quantidade > item.loteQuantidadeAtual) {
      return {
        ok: false,
        error: `Lote ${item.loteCode}: quantidade do pedido (${item.quantidade}) maior que o disponível (${item.loteQuantidadeAtual}).`,
      };
    }
  }
  return { ok: true };
}
