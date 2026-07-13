"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { equineHealthRecordFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createEquineHealthRecordAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(equineHealthRecordFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.equineHealthRecord.create({
    data: data as Prisma.EquineHealthRecordUncheckedCreateInput,
  });

  revalidatePath("/hipica/sanidade");
  redirect("/hipica/sanidade");
}

export async function updateEquineHealthRecordAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(equineHealthRecordFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.equineHealthRecord.update({
    where: { id },
    data: data as Prisma.EquineHealthRecordUncheckedUpdateInput,
  });

  revalidatePath("/hipica/sanidade");
  redirect("/hipica/sanidade");
}

export async function deleteEquineHealthRecordAction(id: string) {
  await prisma.equineHealthRecord.delete({ where: { id } });
  revalidatePath("/hipica/sanidade");
}
