"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { stockBatchFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createStockBatchAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(stockBatchFields, formData);
  if (!data.stockItemId) return { error: "Selecione o item." };
  if (!data.quantity) return { error: "Informe a quantidade." };

  await prisma.$transaction([
    prisma.stockBatch.create({
      data: data as Prisma.StockBatchUncheckedCreateInput,
    }),
    prisma.stockItem.update({
      where: { id: data.stockItemId as string },
      data: { currentQuantity: { increment: data.quantity as Prisma.Decimal | number } },
    }),
  ]);

  revalidatePath("/estoque/lotes");
  revalidatePath("/estoque/materiais");
  redirect("/estoque/lotes");
}

export async function consumeStockBatchAction(id: string) {
  const batch = await prisma.stockBatch.findUnique({ where: { id } });
  if (!batch || batch.status === "CONSUMIDO") return;

  await prisma.$transaction([
    prisma.stockBatch.update({
      where: { id },
      data: { status: "CONSUMIDO" },
    }),
    prisma.stockItem.update({
      where: { id: batch.stockItemId },
      data: { currentQuantity: { decrement: batch.quantity } },
    }),
  ]);

  revalidatePath("/estoque/lotes");
  revalidatePath("/estoque/materiais");
}

export async function deleteStockBatchAction(id: string) {
  const batch = await prisma.stockBatch.findUnique({ where: { id } });
  if (!batch) return;

  const ops: Prisma.PrismaPromise<unknown>[] = [];
  if (batch.status === "DISPONIVEL") {
    ops.push(
      prisma.stockItem.update({
        where: { id: batch.stockItemId },
        data: { currentQuantity: { decrement: batch.quantity } },
      })
    );
  }
  ops.push(prisma.stockBatch.delete({ where: { id } }));

  await prisma.$transaction(ops);

  revalidatePath("/estoque/lotes");
  revalidatePath("/estoque/materiais");
}
