"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getReproductionFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.reproducao.fields");
  const tMethod = await getTranslations("labels.reproductionMethod");
  const tDiagnosis = await getTranslations("labels.diagnosisResult");
  return getReproductionFields(tf, tMethod, tDiagnosis);
}

export async function createReproductionAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.reproducao.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const animal = await prisma.livestockAnimal.findFirst({
    where: { id: data.animalId as string, organizationId },
  });
  if (!animal) return { error: t("animalRequired") };

  await prisma.reproduction.create({
    data: data as Prisma.ReproductionUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/reproducao");
  redirect("/pecuaria/reproducao");
}

export async function updateReproductionAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.reproducao.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.reproduction.updateMany({
    where: { id, animal: { organizationId } },
    data: data as Prisma.ReproductionUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/reproducao");
  redirect("/pecuaria/reproducao");
}

export async function deleteReproductionAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.reproduction.deleteMany({ where: { id, animal: { organizationId } } });
  revalidatePath("/pecuaria/reproducao");
}
