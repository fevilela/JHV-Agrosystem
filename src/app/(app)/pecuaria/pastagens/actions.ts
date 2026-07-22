"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.pastagens.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.pasture.create({
      data: { ...data, organizationId } as Prisma.PastureUncheckedCreateInput,
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("pecuaria.pastagens.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.pasture.updateMany({
      where: { id, organizationId },
      data: data as Prisma.PastureUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/pecuaria/pastagens");
  redirect("/pecuaria/pastagens");
}

export async function deletePastureAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.pasture.deleteMany({ where: { id, organizationId } });
  revalidatePath("/pecuaria/pastagens");
}

export async function updatePastureBoundaryAction(
  id: string,
  boundary: Prisma.InputJsonValue,
  areaHa: number
) {
  const { organizationId } = await requireOrg();
  await prisma.pasture.updateMany({
    where: { id, organizationId },
    data: { boundary, areaHectares: areaHa },
  });
  revalidatePath(`/pecuaria/pastagens/${id}`);
  revalidatePath("/pecuaria/pastagens/mapa");
}
