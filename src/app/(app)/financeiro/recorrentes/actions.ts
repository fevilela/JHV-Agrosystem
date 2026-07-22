"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getRecurringBillingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createRecurringBillingAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("financeiro.recorrentes.errors");
  const tf = await getTranslations("financeiro.recorrentes.fields");
  const data = buildRecordData(getRecurringBillingFields(tf), formData);
  if (!data.clientId) return { error: t("clientRequired") };
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dayOfMonth || Number(data.dayOfMonth) < 1 || Number(data.dayOfMonth) > 28) {
    return { error: t("dayOfMonthInvalid") };
  }
  if (data.dueDay && (Number(data.dueDay) < 1 || Number(data.dueDay) > 28)) {
    return { error: t("dueDayInvalid") };
  }

  await prisma.recurringBilling.create({
    data: data as Prisma.RecurringBillingUncheckedCreateInput,
  });

  revalidatePath("/financeiro/recorrentes");
  redirect("/financeiro/recorrentes");
}

export async function updateRecurringBillingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("financeiro.recorrentes.errors");
  const tf = await getTranslations("financeiro.recorrentes.fields");
  const data = buildRecordData(getRecurringBillingFields(tf), formData);
  if (!data.clientId) return { error: t("clientRequired") };
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dayOfMonth || Number(data.dayOfMonth) < 1 || Number(data.dayOfMonth) > 28) {
    return { error: t("dayOfMonthInvalid") };
  }
  if (data.dueDay && (Number(data.dueDay) < 1 || Number(data.dueDay) > 28)) {
    return { error: t("dueDayInvalid") };
  }

  await prisma.recurringBilling.update({
    where: { id },
    data: data as Prisma.RecurringBillingUncheckedUpdateInput,
  });

  revalidatePath("/financeiro/recorrentes");
  redirect("/financeiro/recorrentes");
}

export async function deleteRecurringBillingAction(id: string) {
  await prisma.recurringBilling.delete({ where: { id } });
  revalidatePath("/financeiro/recorrentes");
}
