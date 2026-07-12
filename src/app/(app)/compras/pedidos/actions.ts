"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { purchaseOrderFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPurchaseOrderAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(purchaseOrderFields, formData);
  if (!data.supplierId) return { error: "Selecione o fornecedor." };
  if (!data.orderDate) return { error: "Informe a data do pedido." };

  await prisma.purchaseOrder.create({
    data: data as Prisma.PurchaseOrderUncheckedCreateInput,
  });

  revalidatePath("/compras/pedidos");
  redirect("/compras/pedidos");
}

export async function updatePurchaseOrderAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(purchaseOrderFields, formData);
  if (!data.supplierId) return { error: "Selecione o fornecedor." };
  if (!data.orderDate) return { error: "Informe a data do pedido." };

  await prisma.purchaseOrder.update({
    where: { id },
    data: data as Prisma.PurchaseOrderUncheckedUpdateInput,
  });

  revalidatePath("/compras/pedidos");
  redirect("/compras/pedidos");
}

export async function deletePurchaseOrderAction(id: string) {
  await prisma.purchaseOrder.delete({ where: { id } });
  revalidatePath("/compras/pedidos");
}

export async function markPurchaseOrderDeliveredAction(id: string) {
  await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "ENTREGUE", actualDeliveryDate: new Date() },
  });
  revalidatePath("/compras/pedidos");
}
