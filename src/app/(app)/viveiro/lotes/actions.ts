"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { buildAdvancePhasePayload } from "@/lib/muda-lote";
import { mudaLoteCreateFields, mudaLoteEditFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMudaLoteAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaLoteCreateFields, formData);
  if (!data.code) return { error: "Informe o código do lote." };
  if (!data.especieId) return { error: "Selecione a espécie." };
  if (!data.viveiroId) return { error: "Selecione o viveiro." };
  if (!data.dataSemeaduraEstaqueamento) return { error: "Informe a data de semeadura/estaqueamento." };
  const quantidadeInicial = Number(data.quantidadeInicial);
  if (!quantidadeInicial || quantidadeInicial <= 0) {
    return { error: "Informe uma quantidade inicial válida." };
  }

  let loteId: string;
  try {
    const lote = await prisma.$transaction(async (tx) => {
      const created = await tx.mudaLote.create({
        data: {
          ...data,
          quantidadeInicial,
          quantidadeAtual: quantidadeInicial,
          organizationId,
        } as Prisma.MudaLoteUncheckedCreateInput,
      });
      await tx.mudaFaseEvento.create({
        data: {
          loteId: created.id,
          fase: "SEMEADURA_ESTAQUEAMENTO",
          dataEntrada: data.dataSemeaduraEstaqueamento as Date,
        },
      });
      return created;
    });
    loteId = lote.id;
  } catch {
    return { error: "Já existe um lote com esse código." };
  }

  revalidatePath("/viveiro/lotes");
  redirect(`/viveiro/lotes/${loteId}`);
}

export async function updateMudaLoteAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaLoteEditFields, formData);
  if (!data.viveiroId) return { error: "Selecione o viveiro." };

  await prisma.mudaLote.updateMany({
    where: { id, organizationId },
    data: data as Prisma.MudaLoteUncheckedUpdateInput,
  });

  revalidatePath(`/viveiro/lotes/${id}`);
  revalidatePath("/viveiro/lotes");
  redirect(`/viveiro/lotes/${id}`);
}

export async function deleteMudaLoteAction(id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaLote.deleteMany({ where: { id, organizationId } });
  revalidatePath("/viveiro/lotes");
}

export async function advanceFaseAction(loteId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");

  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote) return;

  const currentEvent = await prisma.mudaFaseEvento.findFirst({
    where: { loteId, fase: lote.faseAtual, dataSaida: null },
    orderBy: { dataEntrada: "desc" },
  });
  if (!currentEvent) return;

  const raw = formData.get("quantidadePerdida");
  const quantidadePerdida = raw && String(raw).trim() !== "" ? Number(raw) : 0;

  const payload = buildAdvancePhasePayload(currentEvent, quantidadePerdida, new Date());
  if (!payload) return;

  await prisma.$transaction([
    prisma.mudaFaseEvento.update({
      where: { id: payload.closePrevious.id },
      data: {
        dataSaida: payload.closePrevious.dataSaida,
        quantidadePerdida: payload.closePrevious.quantidadePerdida,
      },
    }),
    prisma.mudaFaseEvento.create({
      data: {
        loteId,
        fase: payload.newEvent.fase,
        dataEntrada: payload.newEvent.dataEntrada,
      },
    }),
    prisma.mudaLote.update({
      where: { id: loteId },
      data: {
        faseAtual: payload.newEvent.fase,
        quantidadeAtual: Math.max(0, lote.quantidadeAtual - quantidadePerdida),
      },
    }),
  ]);

  revalidatePath(`/viveiro/lotes/${loteId}`);
  revalidatePath("/viveiro/lotes");
}
