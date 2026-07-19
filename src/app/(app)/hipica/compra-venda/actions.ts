"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { transactionFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTransactionAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(transactionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.value) return { error: "Informe o valor." };

  await prisma.animalTransaction.create({
    data: { ...data, organizationId } as Prisma.AnimalTransactionUncheckedCreateInput,
  });

  revalidatePath("/hipica/compra-venda");
  redirect("/hipica/compra-venda");
}

export async function updateTransactionAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(transactionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.value) return { error: "Informe o valor." };

  await prisma.animalTransaction.updateMany({
    where: { id, organizationId },
    data: data as Prisma.AnimalTransactionUncheckedUpdateInput,
  });

  revalidatePath("/hipica/compra-venda");
  redirect("/hipica/compra-venda");
}

export async function deleteTransactionAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.animalTransaction.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/compra-venda");
}
