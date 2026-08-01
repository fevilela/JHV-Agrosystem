export type PedidoItemLike = { valor: number | string | null | undefined };

export function calcularValorTotal(itens: PedidoItemLike[]): number {
  return itens.reduce((sum, item) => sum + Number(item.valor ?? 0), 0);
}
