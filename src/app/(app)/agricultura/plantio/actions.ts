"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getPlantioFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPlantioAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("agricultura.plantio.errors");
  const tf = await getTranslations("agricultura.plantio.fields");
  const data = buildRecordData(getPlantioFields(tf), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.plantio.create({
    data: data as Prisma.PlantioUncheckedCreateInput,
  });

  revalidatePath("/agricultura/plantio");
  redirect("/agricultura/plantio");
}

export async function updatePlantioAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("agricultura.plantio.errors");
  const tf = await getTranslations("agricultura.plantio.fields");
  const data = buildRecordData(getPlantioFields(tf), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.plantio.update({
    where: { id },
    data: data as Prisma.PlantioUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/plantio");
  redirect("/agricultura/plantio");
}

export async function deletePlantioAction(id: string) {
  await prisma.plantio.delete({ where: { id } });
  revalidatePath("/agricultura/plantio");
}
