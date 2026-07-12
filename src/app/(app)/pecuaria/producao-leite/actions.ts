"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { milkFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMilkAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(milkFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.liters) return { error: "Informe a quantidade de litros." };

  await prisma.milkProduction.create({
    data: data as Prisma.MilkProductionUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/producao-leite");
  redirect("/pecuaria/producao-leite");
}

export async function updateMilkAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(milkFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.liters) return { error: "Informe a quantidade de litros." };

  await prisma.milkProduction.update({
    where: { id },
    data: data as Prisma.MilkProductionUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/producao-leite");
  redirect("/pecuaria/producao-leite");
}

export async function deleteMilkAction(id: string) {
  await prisma.milkProduction.delete({ where: { id } });
  revalidatePath("/pecuaria/producao-leite");
}
