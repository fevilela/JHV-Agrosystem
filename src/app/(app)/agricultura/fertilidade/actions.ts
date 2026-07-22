"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getFertilityFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("agricultura.fertilidade.fields");
  const tType = await getTranslations("labels.fertilityType");
  return getFertilityFields(tf, tType);
}

export async function createFertilityAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("agricultura.fertilidade.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
  const t = await getTranslations("agricultura.fertilidade.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
