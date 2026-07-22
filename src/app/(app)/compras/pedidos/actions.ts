"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getPurchaseOrderFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("compras.pedidos");
  const tStatus = await getTranslations("labels.purchaseOrderStatus");
  return { t, fields: getPurchaseOrderFields(t, tStatus) };
}

export async function createPurchaseOrderAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.supplierId) return { error: t("errors.supplierRequired") };
  if (!data.orderDate) return { error: t("errors.orderDateRequired") };

  await prisma.purchaseOrder.create({
    data: { ...data, organizationId } as Prisma.PurchaseOrderUncheckedCreateInput,
  });

  revalidatePath("/compras/pedidos");
  redirect("/compras/pedidos");
}

export async function updatePurchaseOrderAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.supplierId) return { error: t("errors.supplierRequired") };
  if (!data.orderDate) return { error: t("errors.orderDateRequired") };

  await prisma.purchaseOrder.updateMany({
    where: { id, organizationId },
    data: data as Prisma.PurchaseOrderUncheckedUpdateInput,
  });

  revalidatePath("/compras/pedidos");
  redirect("/compras/pedidos");
}

export async function deletePurchaseOrderAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.purchaseOrder.deleteMany({ where: { id, organizationId } });
  revalidatePath("/compras/pedidos");
}

export async function markPurchaseOrderDeliveredAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.purchaseOrder.updateMany({
    where: { id, organizationId },
    data: { status: "ENTREGUE", actualDeliveryDate: new Date() },
  });
  revalidatePath("/compras/pedidos");
}
