"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { quotationFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createQuotationAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(quotationFields, formData);
  if (!data.supplierId) return { error: "Selecione o fornecedor." };

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
  const data = buildRecordData(quotationFields, formData);
  if (!data.supplierId) return { error: "Selecione o fornecedor." };

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
