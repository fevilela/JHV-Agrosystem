"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getIrrigationFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createIrrigationAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.irrigacao.errors");
  const tf = await getTranslations("agricultura.irrigacao.fields");
  const data = buildRecordData(getIrrigationFields(tf), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const talhao = await prisma.talhao.findFirst({
    where: { id: data.talhaoId as string, organizationId },
  });
  if (!talhao) return { error: t("talhaoRequired") };

  await prisma.irrigation.create({
    data: data as Prisma.IrrigationUncheckedCreateInput,
  });

  revalidatePath("/agricultura/irrigacao");
  redirect("/agricultura/irrigacao");
}

export async function updateIrrigationAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.irrigacao.errors");
  const tf = await getTranslations("agricultura.irrigacao.fields");
  const data = buildRecordData(getIrrigationFields(tf), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.irrigation.updateMany({
    where: { id, talhao: { organizationId } },
    data: data as Prisma.IrrigationUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/irrigacao");
  redirect("/agricultura/irrigacao");
}

export async function deleteIrrigationAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.irrigation.deleteMany({ where: { id, talhao: { organizationId } } });
  revalidatePath("/agricultura/irrigacao");
}
