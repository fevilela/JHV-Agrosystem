"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { talhaoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTalhaoAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(talhaoFields, formData);
  if (!data.code) return { error: "Informe o código do talhão." };

  try {
    await prisma.talhao.create({
      data: data as Prisma.TalhaoUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um talhão com esse código." };
  }

  revalidatePath("/agricultura/talhoes");
  redirect("/agricultura/talhoes");
}

export async function updateTalhaoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(talhaoFields, formData);
  if (!data.code) return { error: "Informe o código do talhão." };

  try {
    await prisma.talhao.update({
      where: { id },
      data: data as Prisma.TalhaoUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um talhão com esse código." };
  }

  revalidatePath("/agricultura/talhoes");
  redirect("/agricultura/talhoes");
}

export async function deleteTalhaoAction(id: string) {
  await prisma.talhao.delete({ where: { id } });
  revalidatePath("/agricultura/talhoes");
}
