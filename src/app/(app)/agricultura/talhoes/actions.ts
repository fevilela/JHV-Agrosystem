"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getTalhaoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTalhaoAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.talhoes.errors");
  const tf = await getTranslations("agricultura.talhoes.fields");
  const data = buildRecordData(getTalhaoFields(tf), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.talhao.create({
      data: { ...data, organizationId } as Prisma.TalhaoUncheckedCreateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/agricultura/talhoes");
  redirect("/agricultura/talhoes");
}

export async function updateTalhaoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.talhoes.errors");
  const tf = await getTranslations("agricultura.talhoes.fields");
  const data = buildRecordData(getTalhaoFields(tf), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.talhao.updateMany({
      where: { id, organizationId },
      data: data as Prisma.TalhaoUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/agricultura/talhoes");
  redirect("/agricultura/talhoes");
}

export async function deleteTalhaoAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.talhao.deleteMany({ where: { id, organizationId } });
  revalidatePath("/agricultura/talhoes");
}
