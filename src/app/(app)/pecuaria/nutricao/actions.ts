"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { feedingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createFeedingAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(feedingFields, formData);
  if (!data.loteId) return { error: "Selecione o lote." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.livestockFeeding.create({
    data: data as Prisma.LivestockFeedingUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/nutricao");
  redirect("/pecuaria/nutricao");
}

export async function updateFeedingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(feedingFields, formData);
  if (!data.loteId) return { error: "Selecione o lote." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.livestockFeeding.update({
    where: { id },
    data: data as Prisma.LivestockFeedingUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/nutricao");
  redirect("/pecuaria/nutricao");
}

export async function deleteFeedingAction(id: string) {
  await prisma.livestockFeeding.delete({ where: { id } });
  revalidatePath("/pecuaria/nutricao");
}
