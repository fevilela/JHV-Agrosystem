"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  const t = await getTranslations("pecuaria.reproducao.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
  const t = await getTranslations("pecuaria.reproducao.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.reproduction.update({
    where: { id },
    data: data as Prisma.ReproductionUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/reproducao");
  redirect("/pecuaria/reproducao");
}

export async function deleteReproductionAction(id: string) {
  await prisma.reproduction.delete({ where: { id } });
  revalidatePath("/pecuaria/reproducao");
}
