"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getStockItemFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createStockItemAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("estoque.materiais");
  const tCategory = await getTranslations("labels.stockCategory");
  const data = buildRecordData(getStockItemFields(t, tCategory), formData);
  if (!data.code) return { error: t("errors.codeRequired") };
  if (!data.name) return { error: t("errors.nameRequired") };

  try {
    await prisma.stockItem.create({
      data: { ...data, organizationId } as Prisma.StockItemUncheckedCreateInput,
    });
  } catch {
    return { error: t("errors.duplicateCode") };
  }

  revalidatePath("/estoque/materiais");
  redirect("/estoque/materiais");
}

export async function updateStockItemAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("estoque.materiais");
  const tCategory = await getTranslations("labels.stockCategory");
  const data = buildRecordData(getStockItemFields(t, tCategory), formData);
  if (!data.code) return { error: t("errors.codeRequired") };
  if (!data.name) return { error: t("errors.nameRequired") };

  try {
    await prisma.stockItem.updateMany({
      where: { id, organizationId },
      data: data as Prisma.StockItemUncheckedUpdateInput,
    });
  } catch {
    return { error: t("errors.duplicateCode") };
  }

  revalidatePath("/estoque/materiais");
  redirect("/estoque/materiais");
}

export async function deleteStockItemAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.stockItem.deleteMany({ where: { id, organizationId } });
  revalidatePath("/estoque/materiais");
}
