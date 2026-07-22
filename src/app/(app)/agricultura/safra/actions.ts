"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getSafraFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("agricultura.safra.fields");
  const tStatus = await getTranslations("labels.safraStatus");
  return getSafraFields(tf, tStatus);
}

export async function createSafraAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.safra.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.name) return { error: t("nameRequired") };
  if (!data.cultura) return { error: t("culturaRequired") };

  const talhao = await prisma.talhao.findFirst({
    where: { id: data.talhaoId as string, organizationId },
  });
  if (!talhao) return { error: t("talhaoRequired") };

  await prisma.safra.create({
    data: data as Prisma.SafraUncheckedCreateInput,
  });

  revalidatePath("/agricultura/safra");
  redirect("/agricultura/safra");
}

export async function updateSafraAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.safra.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.name) return { error: t("nameRequired") };
  if (!data.cultura) return { error: t("culturaRequired") };

  await prisma.safra.updateMany({
    where: { id, talhao: { organizationId } },
    data: data as Prisma.SafraUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/safra");
  redirect("/agricultura/safra");
}

export async function deleteSafraAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.safra.deleteMany({ where: { id, talhao: { organizationId } } });
  revalidatePath("/agricultura/safra");
}
