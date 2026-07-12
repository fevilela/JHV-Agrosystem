"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, PurchaseRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { purchaseRequestFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPurchaseRequestAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(purchaseRequestFields, formData);
  if (!data.description) return { error: "Informe a descrição do item." };
  if (!data.quantity) return { error: "Informe a quantidade." };
  if (!data.date) return { error: "Informe a data." };

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
  const data = buildRecordData(purchaseRequestFields, formData);
  if (!data.description) return { error: "Informe a descrição do item." };
  if (!data.quantity) return { error: "Informe a quantidade." };
  if (!data.date) return { error: "Informe a data." };

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
