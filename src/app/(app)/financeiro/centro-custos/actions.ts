"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getCostCenterFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createCostCenterAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("financeiro.centroCustos.errors");
  const tf = await getTranslations("financeiro.centroCustos.fields");
  const data = buildRecordData(getCostCenterFields(tf), formData);
  if (!data.code) return { error: t("codeRequired") };
  if (!data.name) return { error: t("nameRequired") };

  try {
    await prisma.costCenter.create({
      data: { ...data, organizationId } as Prisma.CostCenterUncheckedCreateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/financeiro/centro-custos");
  redirect("/financeiro/centro-custos");
}

export async function updateCostCenterAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("financeiro.centroCustos.errors");
  const tf = await getTranslations("financeiro.centroCustos.fields");
  const data = buildRecordData(getCostCenterFields(tf), formData);
  if (!data.code) return { error: t("codeRequired") };
  if (!data.name) return { error: t("nameRequired") };

  try {
    await prisma.costCenter.updateMany({
      where: { id, organizationId },
      data: data as Prisma.CostCenterUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/financeiro/centro-custos");
  redirect("/financeiro/centro-custos");
}

export async function deleteCostCenterAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.costCenter.deleteMany({ where: { id, organizationId } });
  revalidatePath("/financeiro/centro-custos");
}
