"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getMovementFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.manejo.fields");
  const tType = await getTranslations("labels.managementMovementType");
  return getMovementFields(tf, tType);
}

export async function createMovementAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.manejo.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.date) return { error: t("dateRequired") };
  if (!data.animalId && !data.loteId) {
    return { error: t("animalOrLoteRequired") };
  }

  await prisma.managementMovement.create({
    data: data as Prisma.ManagementMovementUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/manejo");
  redirect("/pecuaria/manejo");
}

export async function updateMovementAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.manejo.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.date) return { error: t("dateRequired") };
  if (!data.animalId && !data.loteId) {
    return { error: t("animalOrLoteRequired") };
  }

  await prisma.managementMovement.update({
    where: { id },
    data: data as Prisma.ManagementMovementUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/manejo");
  redirect("/pecuaria/manejo");
}

export async function deleteMovementAction(id: string) {
  await prisma.managementMovement.delete({ where: { id } });
  revalidatePath("/pecuaria/manejo");
}
