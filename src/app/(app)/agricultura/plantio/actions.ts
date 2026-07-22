"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getPlantioFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPlantioAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.plantio.errors");
  const tf = await getTranslations("agricultura.plantio.fields");
  const data = buildRecordData(getPlantioFields(tf), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const safra = await prisma.safra.findFirst({
    where: { id: data.safraId as string, talhao: { organizationId } },
  });
  if (!safra) return { error: t("safraRequired") };

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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.plantio.errors");
  const tf = await getTranslations("agricultura.plantio.fields");
  const data = buildRecordData(getPlantioFields(tf), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.plantio.updateMany({
    where: { id, safra: { talhao: { organizationId } } },
    data: data as Prisma.PlantioUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/plantio");
  redirect("/agricultura/plantio");
}

export async function deletePlantioAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.plantio.deleteMany({ where: { id, safra: { talhao: { organizationId } } } });
  revalidatePath("/agricultura/plantio");
}
