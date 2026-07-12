"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { payableFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPayableAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(payableFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dueDate) return { error: "Informe o vencimento." };

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
  const data = buildRecordData(payableFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dueDate) return { error: "Informe o vencimento." };

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
