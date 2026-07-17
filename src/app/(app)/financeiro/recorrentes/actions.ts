"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { recurringBillingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createRecurringBillingAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(recurringBillingFields, formData);
  if (!data.clientId) return { error: "Selecione o cliente." };
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dayOfMonth || Number(data.dayOfMonth) < 1 || Number(data.dayOfMonth) > 28) {
    return { error: "Informe um dia de geração entre 1 e 28." };
  }
  if (data.dueDay && (Number(data.dueDay) < 1 || Number(data.dueDay) > 28)) {
    return { error: "Informe um dia de vencimento entre 1 e 28." };
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
  const data = buildRecordData(recurringBillingFields, formData);
  if (!data.clientId) return { error: "Selecione o cliente." };
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dayOfMonth || Number(data.dayOfMonth) < 1 || Number(data.dayOfMonth) > 28) {
    return { error: "Informe um dia de geração entre 1 e 28." };
  }
  if (data.dueDay && (Number(data.dueDay) < 1 || Number(data.dueDay) > 28)) {
    return { error: "Informe um dia de vencimento entre 1 e 28." };
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
