"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getRecurringBillingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createRecurringBillingAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
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

  const client = await prisma.client.findFirst({
    where: { id: data.clientId as string, organizationId },
  });
  if (!client) return { error: t("clientRequired") };

  await prisma.recurringBilling.create({
    data: { ...data, organizationId } as Prisma.RecurringBillingUncheckedCreateInput,
  });

  revalidatePath("/financeiro/recorrentes");
  redirect("/financeiro/recorrentes");
}

export async function updateRecurringBillingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
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

  await prisma.recurringBilling.updateMany({
    where: { id, organizationId },
    data: data as Prisma.RecurringBillingUncheckedUpdateInput,
  });

  revalidatePath("/financeiro/recorrentes");
  redirect("/financeiro/recorrentes");
}

export async function deleteRecurringBillingAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.recurringBilling.deleteMany({ where: { id, organizationId } });
  revalidatePath("/financeiro/recorrentes");
}
