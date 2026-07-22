"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.manejo.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.date) return { error: t("dateRequired") };
  if (!data.animalId && !data.loteId) {
    return { error: t("animalOrLoteRequired") };
  }

  if (data.animalId) {
    const animal = await prisma.livestockAnimal.findFirst({
      where: { id: data.animalId as string, organizationId },
    });
    if (!animal) return { error: t("animalOrLoteRequired") };
  }
  if (data.loteId) {
    const lote = await prisma.lote.findFirst({
      where: { id: data.loteId as string, organizationId },
    });
    if (!lote) return { error: t("animalOrLoteRequired") };
  }

  await prisma.managementMovement.create({
    data: { ...data, organizationId } as Prisma.ManagementMovementUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/manejo");
  redirect("/pecuaria/manejo");
}

export async function updateMovementAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.manejo.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.date) return { error: t("dateRequired") };
  if (!data.animalId && !data.loteId) {
    return { error: t("animalOrLoteRequired") };
  }

  await prisma.managementMovement.updateMany({
    where: { id, organizationId },
    data: data as Prisma.ManagementMovementUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/manejo");
  redirect("/pecuaria/manejo");
}

export async function deleteMovementAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.managementMovement.deleteMany({ where: { id, organizationId } });
  revalidatePath("/pecuaria/manejo");
}
