"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getChartAccountFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("contabilidade.planoContas");
  const tType = await getTranslations("labels.chartAccountType");
  const tNature = await getTranslations("labels.chartAccountNature");
  return { t, fields: getChartAccountFields(t, tType, tNature) };
}

export async function createChartAccountAction(
  _prevState: FormState,
  formData: FormData
) {
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.code) return { error: t("errors.codeRequired") };
  if (!data.name) return { error: t("errors.nameRequired") };
  if (!data.type) return { error: t("errors.typeRequired") };
  if (!data.nature) return { error: t("errors.natureRequired") };

  try {
    await prisma.chartAccount.create({
      data: data as Prisma.ChartAccountUncheckedCreateInput,
    });
  } catch {
    return { error: t("errors.duplicateCode") };
  }

  revalidatePath("/contabilidade/plano-contas");
  redirect("/contabilidade/plano-contas");
}

export async function updateChartAccountAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.code) return { error: t("errors.codeRequired") };
  if (!data.name) return { error: t("errors.nameRequired") };
  if (!data.type) return { error: t("errors.typeRequired") };
  if (!data.nature) return { error: t("errors.natureRequired") };

  if (data.parentId === id) {
    return { error: t("errors.selfParent") };
  }

  try {
    await prisma.chartAccount.update({
      where: { id },
      data: data as Prisma.ChartAccountUncheckedUpdateInput,
    });
  } catch {
    return { error: t("errors.duplicateCode") };
  }

  revalidatePath("/contabilidade/plano-contas");
  redirect("/contabilidade/plano-contas");
}

export async function deleteChartAccountAction(id: string) {
  await prisma.chartAccount.delete({ where: { id } });
  revalidatePath("/contabilidade/plano-contas");
}
