"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, PurchaseRequestStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getPurchaseRequestFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("compras.solicitacoes");
  const tStatus = await getTranslations("labels.purchaseRequestStatus");
  return { t, fields: getPurchaseRequestFields(t, tStatus) };
}

export async function createPurchaseRequestAction(
  _prevState: FormState,
  formData: FormData
) {
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.description) return { error: t("errors.descriptionRequired") };
  if (!data.quantity) return { error: t("errors.quantityRequired") };
  if (!data.date) return { error: t("errors.dateRequired") };

  await prisma.purchaseRequest.create({
    data: data as Prisma.PurchaseRequestUncheckedCreateInput,
  });

  revalidatePath("/compras/solicitacoes");
  redirect("/compras/solicitacoes");
}

export async function updatePurchaseRequestAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.description) return { error: t("errors.descriptionRequired") };
  if (!data.quantity) return { error: t("errors.quantityRequired") };
  if (!data.date) return { error: t("errors.dateRequired") };

  await prisma.purchaseRequest.update({
    where: { id },
    data: data as Prisma.PurchaseRequestUncheckedUpdateInput,
  });

  revalidatePath("/compras/solicitacoes");
  redirect("/compras/solicitacoes");
}

export async function deletePurchaseRequestAction(id: string) {
  await prisma.purchaseRequest.delete({ where: { id } });
  revalidatePath("/compras/solicitacoes");
}

export async function setPurchaseRequestStatusAction(
  id: string,
  status: PurchaseRequestStatus
) {
  await prisma.purchaseRequest.update({ where: { id }, data: { status } });
  revalidatePath("/compras/solicitacoes");
}
