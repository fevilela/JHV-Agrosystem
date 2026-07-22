"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.sanidade.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const animal = await prisma.livestockAnimal.findFirst({
    where: { id: data.animalId as string, organizationId },
  });
  if (!animal) return { error: t("animalRequired") };

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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.sanidade.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.healthRecord.updateMany({
    where: { id, animal: { organizationId } },
    data: data as Prisma.HealthRecordUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/sanidade");
  redirect("/pecuaria/sanidade");
}

export async function deleteHealthRecordAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.healthRecord.deleteMany({ where: { id, animal: { organizationId } } });
  revalidatePath("/pecuaria/sanidade");
}
