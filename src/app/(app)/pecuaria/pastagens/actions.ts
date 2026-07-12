"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { pastureFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPastureAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(pastureFields, formData);
  if (!data.code) return { error: "Informe o código da pastagem." };

  try {
    await prisma.pasture.create({
      data: data as Prisma.PastureUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe uma pastagem com esse código." };
  }

  revalidatePath("/pecuaria/pastagens");
  redirect("/pecuaria/pastagens");
}

export async function updatePastureAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(pastureFields, formData);
  if (!data.code) return { error: "Informe o código da pastagem." };

  try {
    await prisma.pasture.update({
      where: { id },
      data: data as Prisma.PastureUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe uma pastagem com esse código." };
  }

  revalidatePath("/pecuaria/pastagens");
  redirect("/pecuaria/pastagens");
}

export async function deletePastureAction(id: string) {
  await prisma.pasture.delete({ where: { id } });
  revalidatePath("/pecuaria/pastagens");
}
