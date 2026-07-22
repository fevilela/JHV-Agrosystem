"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { gerarBoletoParaConta, cancelarBoletoParaConta } from "@/lib/boleto-service";
import { getReceivableFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("financeiro.contasReceber.fields");
  const tStatus = await getTranslations("labels.financeEntryStatus");
  const tPaymentMethod = await getTranslations("labels.paymentMethod");
  return getReceivableFields(tf, tStatus, tPaymentMethod);
}

export async function createReceivableAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("financeiro.contasReceber.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  await prisma.financeEntry.create({
    data: { ...data, type: "RECEBER" } as Prisma.FinanceEntryUncheckedCreateInput,
  });

  revalidatePath("/financeiro/contas-receber");
  redirect("/financeiro/contas-receber");
}

export async function updateReceivableAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("financeiro.contasReceber.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  await prisma.financeEntry.update({
    where: { id },
    data: data as Prisma.FinanceEntryUncheckedUpdateInput,
  });

  revalidatePath("/financeiro/contas-receber");
  redirect("/financeiro/contas-receber");
}

export async function deleteReceivableAction(id: string) {
  await prisma.financeEntry.delete({ where: { id } });
  revalidatePath("/financeiro/contas-receber");
}

export async function markReceivableReceivedAction(id: string) {
  await prisma.financeEntry.update({
    where: { id },
    data: { status: "PAGO", paymentDate: new Date() },
  });
  revalidatePath("/financeiro/contas-receber");
}

type BoletoState = { error?: string } | undefined;

export async function gerarBoletoAction(
  id: string,
  _prevState: BoletoState
): Promise<BoletoState> {
  const t = await getTranslations("financeiro.contasReceber.errors");
  const entry = await prisma.financeEntry.findUnique({ where: { id } });
  if (!entry) return { error: t("notFound") };
  if (entry.mpPaymentId) return undefined;

  const resultado = await gerarBoletoParaConta(id);
  if (resultado.error) return { error: resultado.error };

  revalidatePath("/financeiro/contas-receber");
  return undefined;
}

export async function cancelarBoletoAction(id: string) {
  await cancelarBoletoParaConta(id);
  revalidatePath("/financeiro/contas-receber");
}
