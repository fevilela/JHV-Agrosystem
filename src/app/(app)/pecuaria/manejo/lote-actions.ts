"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getLoteFields } from "./lote-fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.lotes.fields");
  const tCategory = await getTranslations("labels.livestockCategory");
  return getLoteFields(tf, tCategory);
}

export async function createLoteAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.lotes.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.lote.create({
      data: data as Prisma.LoteUncheckedCreateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/pecuaria/manejo/lotes");
  redirect("/pecuaria/manejo/lotes");
}

export async function updateLoteAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.lotes.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.lote.update({
      where: { id },
      data: data as Prisma.LoteUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/pecuaria/manejo/lotes");
  redirect("/pecuaria/manejo/lotes");
}

export async function deleteLoteAction(id: string) {
  await prisma.lote.delete({ where: { id } });
  revalidatePath("/pecuaria/manejo/lotes");
}
