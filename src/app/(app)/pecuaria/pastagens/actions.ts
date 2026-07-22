"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getPastureFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.pastagens.fields");
  const tStatus = await getTranslations("labels.pastureRotationStatus");
  return getPastureFields(tf, tStatus);
}

export async function createPastureAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.pastagens.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.pasture.create({
      data: data as Prisma.PastureUncheckedCreateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/pecuaria/pastagens");
  redirect("/pecuaria/pastagens");
}

export async function updatePastureAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.pastagens.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.pasture.update({
      where: { id },
      data: data as Prisma.PastureUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/pecuaria/pastagens");
  redirect("/pecuaria/pastagens");
}

export async function deletePastureAction(id: string) {
  await prisma.pasture.delete({ where: { id } });
  revalidatePath("/pecuaria/pastagens");
}
