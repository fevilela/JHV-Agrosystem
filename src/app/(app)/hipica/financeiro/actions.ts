"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { financialFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createFinancialAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(financialFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };

  await prisma.financialEntry.create({
    data: { ...data, organizationId } as Prisma.FinancialEntryUncheckedCreateInput,
  });

  revalidatePath("/hipica/financeiro");
  redirect("/hipica/financeiro");
}

export async function updateFinancialAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(financialFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };

  await prisma.financialEntry.updateMany({
    where: { id, organizationId },
    data: data as Prisma.FinancialEntryUncheckedUpdateInput,
  });

  revalidatePath("/hipica/financeiro");
  redirect("/hipica/financeiro");
}

export async function deleteFinancialAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.financialEntry.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/financeiro");
}

export async function markFinancialPaidAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.financialEntry.updateMany({
    where: { id, organizationId },
    data: { status: "PAGO", paidDate: new Date() },
  });
  revalidatePath("/hipica/financeiro");
}
