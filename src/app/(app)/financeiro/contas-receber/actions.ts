"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("financeiro.contasReceber.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  await prisma.financeEntry.create({
    data: { ...data, type: "RECEBER", organizationId } as Prisma.FinanceEntryUncheckedCreateInput,
  });

  revalidatePath("/financeiro/contas-receber");
  redirect("/financeiro/contas-receber");
}

export async function updateReceivableAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("financeiro.contasReceber.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  await prisma.financeEntry.updateMany({
    where: { id, organizationId },
    data: data as Prisma.FinanceEntryUncheckedUpdateInput,
  });

  revalidatePath("/financeiro/contas-receber");
  redirect("/financeiro/contas-receber");
}

export async function deleteReceivableAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.financeEntry.deleteMany({ where: { id, organizationId } });
  revalidatePath("/financeiro/contas-receber");
}

export async function markReceivableReceivedAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.financeEntry.updateMany({
    where: { id, organizationId },
    data: { status: "PAGO", paymentDate: new Date() },
  });
  revalidatePath("/financeiro/contas-receber");
}

type BoletoState = { error?: string } | undefined;

export async function gerarBoletoAction(
  id: string,
  _prevState: BoletoState
): Promise<BoletoState> {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("financeiro.contasReceber.errors");
  const entry = await prisma.financeEntry.findFirst({ where: { id, organizationId } });
  if (!entry) return { error: t("notFound") };
  if (entry.mpPaymentId) return undefined;

  const resultado = await gerarBoletoParaConta(id);
  if (resultado.error) return { error: resultado.error };

  revalidatePath("/financeiro/contas-receber");
  return undefined;
}

export async function cancelarBoletoAction(id: string) {
  const { organizationId } = await requireOrg();
  const entry = await prisma.financeEntry.findFirst({ where: { id, organizationId } });
  if (!entry) return;
  await cancelarBoletoParaConta(id);
  revalidatePath("/financeiro/contas-receber");
}
