"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  const t = await getTranslations("agricultura.safra.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.name) return { error: t("nameRequired") };
  if (!data.cultura) return { error: t("culturaRequired") };

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
  const t = await getTranslations("agricultura.safra.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.talhaoId) return { error: t("talhaoRequired") };
  if (!data.name) return { error: t("nameRequired") };
  if (!data.cultura) return { error: t("culturaRequired") };

  await prisma.safra.update({
    where: { id },
    data: data as Prisma.SafraUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/safra");
  redirect("/agricultura/safra");
}

export async function deleteSafraAction(id: string) {
  await prisma.safra.delete({ where: { id } });
  revalidatePath("/agricultura/safra");
}
