"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getQuotationFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("compras.cotacoes");
  const tStatus = await getTranslations("labels.quotationStatus");
  return { t, fields: getQuotationFields(t, tStatus) };
}

export async function createQuotationAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.supplierId) return { error: t("errors.supplierRequired") };

  await prisma.quotation.create({
    data: { ...data, organizationId } as Prisma.QuotationUncheckedCreateInput,
  });

  revalidatePath("/compras/cotacoes");
  redirect("/compras/cotacoes");
}

export async function updateQuotationAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.supplierId) return { error: t("errors.supplierRequired") };

  await prisma.quotation.updateMany({
    where: { id, organizationId },
    data: data as Prisma.QuotationUncheckedUpdateInput,
  });

  revalidatePath("/compras/cotacoes");
  redirect("/compras/cotacoes");
}

export async function deleteQuotationAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.quotation.deleteMany({ where: { id, organizationId } });
  revalidatePath("/compras/cotacoes");
}
