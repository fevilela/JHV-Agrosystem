"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
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
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.supplierId) return { error: t("errors.supplierRequired") };

  await prisma.quotation.create({
    data: data as Prisma.QuotationUncheckedCreateInput,
  });

  revalidatePath("/compras/cotacoes");
  redirect("/compras/cotacoes");
}

export async function updateQuotationAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.supplierId) return { error: t("errors.supplierRequired") };

  await prisma.quotation.update({
    where: { id },
    data: data as Prisma.QuotationUncheckedUpdateInput,
  });

  revalidatePath("/compras/cotacoes");
  redirect("/compras/cotacoes");
}

export async function deleteQuotationAction(id: string) {
  await prisma.quotation.delete({ where: { id } });
  revalidatePath("/compras/cotacoes");
}
