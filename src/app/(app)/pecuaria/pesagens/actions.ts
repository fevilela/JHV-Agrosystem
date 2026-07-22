"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getWeightFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createWeightAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.pesagens.errors");
  const tf = await getTranslations("pecuaria.pesagens.fields");
  const data = buildRecordData(getWeightFields(tf), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };
  if (!data.weightKg) return { error: t("weightRequired") };

  await prisma.$transaction([
    prisma.weightRecord.create({
      data: data as Prisma.WeightRecordUncheckedCreateInput,
    }),
    prisma.livestockAnimal.update({
      where: { id: data.animalId as string },
      data: { pesoAtual: data.weightKg as Prisma.Decimal | number },
    }),
  ]);

  revalidatePath("/pecuaria/pesagens");
  revalidatePath("/pecuaria/cadastro-animal");
  redirect("/pecuaria/pesagens");
}

export async function updateWeightAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.pesagens.errors");
  const tf = await getTranslations("pecuaria.pesagens.fields");
  const data = buildRecordData(getWeightFields(tf), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };
  if (!data.weightKg) return { error: t("weightRequired") };

  await prisma.weightRecord.update({
    where: { id },
    data: data as Prisma.WeightRecordUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/pesagens");
  redirect("/pecuaria/pesagens");
}

export async function deleteWeightAction(id: string) {
  await prisma.weightRecord.delete({ where: { id } });
  revalidatePath("/pecuaria/pesagens");
}
