"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { safraFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createSafraAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(safraFields, formData);
  if (!data.talhaoId) return { error: "Selecione o talhão." };
  if (!data.name) return { error: "Informe o nome da safra." };
  if (!data.cultura) return { error: "Informe a cultura." };

  await prisma.safra.create({
    data: data as Prisma.SafraUncheckedCreateInput,
  });

  revalidatePath("/agricultura/safra");
  redirect("/agricultura/safra");
}

export async function updateSafraAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(safraFields, formData);
  if (!data.talhaoId) return { error: "Selecione o talhão." };
  if (!data.name) return { error: "Informe o nome da safra." };
  if (!data.cultura) return { error: "Informe a cultura." };

  await prisma.safra.update({
    where: { id },
    data: data as Prisma.SafraUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/safra");
  redirect("/agricultura/safra");
}

export async function deleteSafraAction(id: string) {
  await prisma.safra.delete({ where: { id } });
  revalidatePath("/agricultura/safra");
}
