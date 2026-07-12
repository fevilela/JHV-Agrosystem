"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { healthRecordFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createHealthRecordAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(healthRecordFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.healthRecord.create({
    data: data as Prisma.HealthRecordUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/sanidade");
  redirect("/pecuaria/sanidade");
}

export async function updateHealthRecordAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(healthRecordFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.healthRecord.update({
    where: { id },
    data: data as Prisma.HealthRecordUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/sanidade");
  redirect("/pecuaria/sanidade");
}

export async function deleteHealthRecordAction(id: string) {
  await prisma.healthRecord.delete({ where: { id } });
  revalidatePath("/pecuaria/sanidade");
}
