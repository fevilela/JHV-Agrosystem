"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getFeedingFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.nutricao.fields");
  const tType = await getTranslations("labels.feedingType");
  return getFeedingFields(tf, tType);
}

export async function createFeedingAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.nutricao.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.loteId) return { error: t("loteRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const lote = await prisma.lote.findFirst({
    where: { id: data.loteId as string, organizationId },
  });
  if (!lote) return { error: t("loteRequired") };

  await prisma.livestockFeeding.create({
    data: data as Prisma.LivestockFeedingUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/nutricao");
  redirect("/pecuaria/nutricao");
}

export async function updateFeedingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.nutricao.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.loteId) return { error: t("loteRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.livestockFeeding.updateMany({
    where: { id, lote: { organizationId } },
    data: data as Prisma.LivestockFeedingUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/nutricao");
  redirect("/pecuaria/nutricao");
}

export async function deleteFeedingAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.livestockFeeding.deleteMany({ where: { id, lote: { organizationId } } });
  revalidatePath("/pecuaria/nutricao");
}
