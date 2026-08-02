"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { loteDisponivelParaVenda } from "@/lib/muda-lote";
import { calcularValorTotalPedidoVenda, validarItensParaConfirmacao } from "@/lib/muda-pedido-venda";
import { mudaPedidoVendaFields } from "./fields";

type FormState = { error?: string } | undefined;

async function recalcularValorTotal(pedidoId: string) {
  const itens = await prisma.mudaPedidoVendaItem.findMany({ where: { pedidoId } });
  const valorTotal = calcularValorTotalPedidoVenda(
    itens.map((i) => ({ quantidade: i.quantidade, precoUnitario: i.precoUnitario.toString() }))
  );
  await prisma.mudaPedidoVenda.update({ where: { id: pedidoId }, data: { valorTotal } });
}

export async function createMudaPedidoVendaAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaPedidoVendaFields, formData);
  if (!data.numero) return { error: "Informe o número do pedido." };
  if (!data.clienteId) return { error: "Selecione o cliente." };
  if (!data.dataPedido) return { error: "Informe a data do pedido." };

  let pedidoId: string;
  try {
    const pedido = await prisma.mudaPedidoVenda.create({
      data: { ...data, organizationId } as Prisma.MudaPedidoVendaUncheckedCreateInput,
    });
    pedidoId = pedido.id;
  } catch {
    return { error: "Já existe um pedido com esse número." };
  }

  revalidatePath("/viveiro/pedidos");
  redirect(`/viveiro/pedidos/${pedidoId}`);
}

export async function updateMudaPedidoVendaAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaPedidoVendaFields, formData);
  if (!data.numero) return { error: "Informe o número do pedido." };
  if (!data.clienteId) return { error: "Selecione o cliente." };
  if (!data.dataPedido) return { error: "Informe a data do pedido." };

  try {
    await prisma.mudaPedidoVenda.updateMany({
      where: { id, organizationId },
      data: data as Prisma.MudaPedidoVendaUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um pedido com esse número." };
  }

  revalidatePath(`/viveiro/pedidos/${id}`);
  revalidatePath("/viveiro/pedidos");
  redirect(`/viveiro/pedidos/${id}`);
}

// Só permite excluir enquanto PENDENTE — um pedido CONFIRMADO já decrementou
// quantidadeAtual dos lotes; excluir sem cancelar antes deixaria isso sem reversão.
export async function deleteMudaPedidoVendaAction(id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaPedidoVenda.deleteMany({
    where: { id, organizationId, status: "PENDENTE" },
  });
  revalidatePath("/viveiro/pedidos");
}

export async function addMudaPedidoVendaItemAction(pedidoId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");
  const loteId = formData.get("loteId") as string | null;
  const quantidadeRaw = formData.get("quantidade") as string | null;
  const precoUnitarioRaw = formData.get("precoUnitario") as string | null;
  if (!loteId || !quantidadeRaw || !precoUnitarioRaw) return;

  const pedido = await prisma.mudaPedidoVenda.findFirst({ where: { id: pedidoId, organizationId } });
  if (!pedido || pedido.status !== "PENDENTE") return;

  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote || !loteDisponivelParaVenda(lote.faseAtual, lote.quantidadeAtual)) return;

  await prisma.mudaPedidoVendaItem.create({
    data: {
      pedidoId,
      loteId,
      quantidade: Number(quantidadeRaw),
      precoUnitario: Number(precoUnitarioRaw),
    },
  });
  await recalcularValorTotal(pedidoId);

  revalidatePath(`/viveiro/pedidos/${pedidoId}`);
}

export async function deleteMudaPedidoVendaItemAction(pedidoId: string, itemId: string) {
  const { organizationId } = await requireModule("viveiro");
  const pedido = await prisma.mudaPedidoVenda.findFirst({ where: { id: pedidoId, organizationId } });
  if (!pedido || pedido.status !== "PENDENTE") return;

  await prisma.mudaPedidoVendaItem.deleteMany({ where: { id: itemId, pedidoId } });
  await recalcularValorTotal(pedidoId);

  revalidatePath(`/viveiro/pedidos/${pedidoId}`);
}

export async function confirmMudaPedidoVendaAction(
  pedidoId: string,
  _prevState: FormState
): Promise<FormState> {
  const { organizationId } = await requireModule("viveiro");
  const pedido = await prisma.mudaPedidoVenda.findFirst({
    where: { id: pedidoId, organizationId },
    include: { itens: { include: { lote: true } } },
  });
  if (!pedido) return { error: "Pedido não encontrado." };
  if (pedido.status !== "PENDENTE") return { error: "Esse pedido já foi confirmado, entregue ou cancelado." };
  if (pedido.itens.length === 0) return { error: "Adicione pelo menos um item antes de confirmar." };

  const validacao = validarItensParaConfirmacao(
    pedido.itens.map((i) => ({
      loteId: i.loteId,
      loteCode: i.lote.code,
      quantidade: i.quantidade,
      loteQuantidadeAtual: i.lote.quantidadeAtual,
    }))
  );
  if (!validacao.ok) return { error: validacao.error };

  await prisma.$transaction([
    prisma.mudaPedidoVenda.update({ where: { id: pedidoId }, data: { status: "CONFIRMADO" } }),
    ...pedido.itens.map((item) =>
      prisma.mudaLote.update({
        where: { id: item.loteId },
        data: { quantidadeAtual: { decrement: item.quantidade } },
      })
    ),
  ]);

  revalidatePath(`/viveiro/pedidos/${pedidoId}`);
  revalidatePath("/viveiro/pedidos");
  revalidatePath("/viveiro/lotes");
}

// Reverte a baixa de estoque só quando o pedido já estava CONFIRMADO (PENDENTE nunca
// decrementou nada). Não permite cancelar um pedido já ENTREGUE.
export async function cancelMudaPedidoVendaAction(pedidoId: string) {
  const { organizationId } = await requireModule("viveiro");
  const pedido = await prisma.mudaPedidoVenda.findFirst({
    where: { id: pedidoId, organizationId },
    include: { itens: true },
  });
  if (!pedido || (pedido.status !== "PENDENTE" && pedido.status !== "CONFIRMADO")) return;

  const eraConfirmado = pedido.status === "CONFIRMADO";

  await prisma.$transaction([
    prisma.mudaPedidoVenda.update({ where: { id: pedidoId }, data: { status: "CANCELADO" } }),
    ...(eraConfirmado
      ? pedido.itens.map((item) =>
          prisma.mudaLote.update({
            where: { id: item.loteId },
            data: { quantidadeAtual: { increment: item.quantidade } },
          })
        )
      : []),
  ]);

  revalidatePath(`/viveiro/pedidos/${pedidoId}`);
  revalidatePath("/viveiro/pedidos");
  revalidatePath("/viveiro/lotes");
}

export async function markMudaPedidoVendaEntregueAction(pedidoId: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaPedidoVenda.updateMany({
    where: { id: pedidoId, organizationId, status: "CONFIRMADO" },
    data: { status: "ENTREGUE" },
  });
  revalidatePath(`/viveiro/pedidos/${pedidoId}`);
  revalidatePath("/viveiro/pedidos");
}
