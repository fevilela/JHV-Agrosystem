"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { loteFields } from "./lote-fields";

type FormState = { error?: string } | undefined;

export async function createLoteAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(loteFields, formData);
  if (!data.code) return { error: "Informe o código do lote." };

  try {
    await prisma.lote.create({
      data: data as Prisma.LoteUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um lote com esse código." };
  }

  revalidatePath("/pecuaria/manejo/lotes");
  redirect("/pecuaria/manejo/lotes");
}

export async function updateLoteAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(loteFields, formData);
  if (!data.code) return { error: "Informe o código do lote." };

  try {
    await prisma.lote.update({
      where: { id },
      data: data as Prisma.LoteUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um lote com esse código." };
  }

  revalidatePath("/pecuaria/manejo/lotes");
  redirect("/pecuaria/manejo/lotes");
}

export async function deleteLoteAction(id: string) {
  await prisma.lote.delete({ where: { id } });
  revalidatePath("/pecuaria/manejo/lotes");
}
