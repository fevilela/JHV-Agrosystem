"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getPayableFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("financeiro.contasPagar.fields");
  const tStatus = await getTranslations("labels.financeEntryStatus");
  const tPaymentMethod = await getTranslations("labels.paymentMethod");
  return getPayableFields(tf, tStatus, tPaymentMethod);
}

export async function createPayableAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("financeiro.contasPagar.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  await prisma.financeEntry.create({
    data: { ...data, type: "PAGAR" } as Prisma.FinanceEntryUncheckedCreateInput,
  });

  revalidatePath("/financeiro/contas-pagar");
  redirect("/financeiro/contas-pagar");
}

export async function updatePayableAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("financeiro.contasPagar.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  await prisma.financeEntry.update({
    where: { id },
    data: data as Prisma.FinanceEntryUncheckedUpdateInput,
  });

  revalidatePath("/financeiro/contas-pagar");
  redirect("/financeiro/contas-pagar");
}

export async function deletePayableAction(id: string) {
  await prisma.financeEntry.delete({ where: { id } });
  revalidatePath("/financeiro/contas-pagar");
}

export async function markPayablePaidAction(id: string) {
  await prisma.financeEntry.update({
    where: { id },
    data: { status: "PAGO", paymentDate: new Date() },
  });
  revalidatePath("/financeiro/contas-pagar");
}
