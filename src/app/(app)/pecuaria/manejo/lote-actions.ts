"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.lotes.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.lote.create({
      data: { ...data, organizationId } as Prisma.LoteUncheckedCreateInput,
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.lotes.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.lote.updateMany({
      where: { id, organizationId },
      data: data as Prisma.LoteUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/pecuaria/manejo/lotes");
  redirect("/pecuaria/manejo/lotes");
}

export async function deleteLoteAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.lote.deleteMany({ where: { id, organizationId } });
  revalidatePath("/pecuaria/manejo/lotes");
}
