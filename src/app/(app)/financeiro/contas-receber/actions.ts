"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { receivableFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createReceivableAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(receivableFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dueDate) return { error: "Informe o vencimento." };

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
  const data = buildRecordData(receivableFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dueDate) return { error: "Informe o vencimento." };

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
