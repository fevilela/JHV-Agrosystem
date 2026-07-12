"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { fertilityFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createFertilityAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(fertilityFields, formData);
  if (!data.talhaoId) return { error: "Selecione o talhão." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.fertility.create({
    data: data as Prisma.FertilityUncheckedCreateInput,
  });

  revalidatePath("/agricultura/fertilidade");
  redirect("/agricultura/fertilidade");
}

export async function updateFertilityAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(fertilityFields, formData);
  if (!data.talhaoId) return { error: "Selecione o talhão." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.fertility.update({
    where: { id },
    data: data as Prisma.FertilityUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/fertilidade");
  redirect("/agricultura/fertilidade");
}

export async function deleteFertilityAction(id: string) {
  await prisma.fertility.delete({ where: { id } });
  revalidatePath("/agricultura/fertilidade");
}
