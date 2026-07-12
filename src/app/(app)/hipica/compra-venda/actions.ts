"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { transactionFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTransactionAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(transactionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.value) return { error: "Informe o valor." };

  await prisma.animalTransaction.create({
    data: data as Prisma.AnimalTransactionUncheckedCreateInput,
  });

  revalidatePath("/hipica/compra-venda");
  redirect("/hipica/compra-venda");
}

export async function updateTransactionAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(transactionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.value) return { error: "Informe o valor." };

  await prisma.animalTransaction.update({
    where: { id },
    data: data as Prisma.AnimalTransactionUncheckedUpdateInput,
  });

  revalidatePath("/hipica/compra-venda");
  redirect("/hipica/compra-venda");
}

export async function deleteTransactionAction(id: string) {
  await prisma.animalTransaction.delete({ where: { id } });
  revalidatePath("/hipica/compra-venda");
}
