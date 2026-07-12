"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { stockItemFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createStockItemAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(stockItemFields, formData);
  if (!data.code) return { error: "Informe o código do item." };
  if (!data.name) return { error: "Informe o nome do item." };

  try {
    await prisma.stockItem.create({
      data: data as Prisma.StockItemUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um item com esse código ou código de barras." };
  }

  revalidatePath("/estoque/materiais");
  redirect("/estoque/materiais");
}

export async function updateStockItemAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(stockItemFields, formData);
  if (!data.code) return { error: "Informe o código do item." };
  if (!data.name) return { error: "Informe o nome do item." };

  try {
    await prisma.stockItem.update({
      where: { id },
      data: data as Prisma.StockItemUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um item com esse código ou código de barras." };
  }

  revalidatePath("/estoque/materiais");
  redirect("/estoque/materiais");
}

export async function deleteStockItemAction(id: string) {
  await prisma.stockItem.delete({ where: { id } });
  revalidatePath("/estoque/materiais");
}
