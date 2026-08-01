"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { pedidoAnaliseFields } from "./fields";
import { calcularValorTotal } from "@/lib/pedido-analise";

type FormState = { error?: string } | undefined;

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, name: string) {
  const value = str(formData, name);
  return value === null ? null : Number(value);
}

async function recalcularValorTotal(pedidoAnaliseId: string) {
  const itens = await prisma.pedidoAnaliseItem.findMany({ where: { pedidoAnaliseId } });
  const valorTotal = calcularValorTotal(itens.map((i) => ({ valor: i.valor?.toString() ?? null })));
  await prisma.pedidoAnalise.update({ where: { id: pedidoAnaliseId }, data: { valorTotal } });
}

export async function createPedidoAnaliseAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(pedidoAnaliseFields, formData);
  if (!data.numero) return { error: "Informe o número do pedido." };
  if (!data.produtorId) return { error: "Selecione o produtor." };

  let pedidoId: string;
  try {
    const pedido = await prisma.pedidoAnalise.create({
      data: { ...data, organizationId } as Prisma.PedidoAnaliseUncheckedCreateInput,
    });
    pedidoId = pedido.id;
  } catch {
    return { error: "Já existe um pedido com esse número." };
  }

  revalidatePath("/laboratorio/pedidos");
  redirect(`/laboratorio/pedidos/${pedidoId}`);
}

export async function updatePedidoAnaliseAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(pedidoAnaliseFields, formData);
  if (!data.numero) return { error: "Informe o número do pedido." };
  if (!data.produtorId) return { error: "Selecione o produtor." };

  try {
    await prisma.pedidoAnalise.updateMany({
      where: { id, organizationId },
      data: data as Prisma.PedidoAnaliseUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um pedido com esse número." };
  }

  revalidatePath(`/laboratorio/pedidos/${id}`);
  revalidatePath("/laboratorio/pedidos");
  redirect(`/laboratorio/pedidos/${id}`);
}

export async function deletePedidoAnaliseAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.pedidoAnalise.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/pedidos");
}

export async function updateStatusFinanceiroAction(
  pedidoId: string,
  status: "PENDENTE" | "PAGO" | "VENCIDO"
) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.pedidoAnalise.updateMany({ where: { id: pedidoId, organizationId }, data: { statusFinanceiro: status } });
  revalidatePath(`/laboratorio/pedidos/${pedidoId}`);
  revalidatePath("/laboratorio/pedidos");
}

export async function addItemPedidoAction(pedidoId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const pedido = await prisma.pedidoAnalise.findFirst({ where: { id: pedidoId, organizationId } });
  if (!pedido) return;

  const descricao = str(formData, "descricao");
  if (!descricao) return;

  await prisma.pedidoAnaliseItem.create({
    data: {
      pedidoAnaliseId: pedidoId,
      descricao,
      valor: num(formData, "valor"),
      amostraId: str(formData, "amostraId"),
    },
  });
  await recalcularValorTotal(pedidoId);

  revalidatePath(`/laboratorio/pedidos/${pedidoId}`);
}

export async function deleteItemPedidoAction(pedidoId: string, itemId: string) {
  const { organizationId } = await requireModule("laboratorio");
  const pedido = await prisma.pedidoAnalise.findFirst({ where: { id: pedidoId, organizationId } });
  if (!pedido) return;

  await prisma.pedidoAnaliseItem.deleteMany({ where: { id: itemId, pedidoAnaliseId: pedidoId } });
  await recalcularValorTotal(pedidoId);

  revalidatePath(`/laboratorio/pedidos/${pedidoId}`);
}
