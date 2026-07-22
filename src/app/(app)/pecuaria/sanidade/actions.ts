"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getHealthRecordFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.sanidade.fields");
  const tType = await getTranslations("labels.healthRecordType");
  return getHealthRecordFields(tf, tType);
}

export async function createHealthRecordAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.sanidade.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
  const t = await getTranslations("pecuaria.sanidade.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
