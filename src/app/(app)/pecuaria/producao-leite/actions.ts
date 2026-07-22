"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getMilkFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.producaoLeite.fields");
  const tShift = await getTranslations("labels.milkShift");
  return getMilkFields(tf, tShift);
}

export async function createMilkAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.producaoLeite.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };
  if (!data.liters) return { error: t("litersRequired") };

  await prisma.milkProduction.create({
    data: data as Prisma.MilkProductionUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/producao-leite");
  redirect("/pecuaria/producao-leite");
}

export async function updateMilkAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.producaoLeite.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.animalId) return { error: t("animalRequired") };
  if (!data.date) return { error: t("dateRequired") };
  if (!data.liters) return { error: t("litersRequired") };

  await prisma.milkProduction.update({
    where: { id },
    data: data as Prisma.MilkProductionUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/producao-leite");
  redirect("/pecuaria/producao-leite");
}

export async function deleteMilkAction(id: string) {
  await prisma.milkProduction.delete({ where: { id } });
  revalidatePath("/pecuaria/producao-leite");
}
