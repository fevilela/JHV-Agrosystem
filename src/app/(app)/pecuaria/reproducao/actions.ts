"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { reproductionFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createReproductionAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(reproductionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.reproduction.create({
    data: data as Prisma.ReproductionUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/reproducao");
  redirect("/pecuaria/reproducao");
}

export async function updateReproductionAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(reproductionFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.reproduction.update({
    where: { id },
    data: data as Prisma.ReproductionUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/reproducao");
  redirect("/pecuaria/reproducao");
}

export async function deleteReproductionAction(id: string) {
  await prisma.reproduction.delete({ where: { id } });
  revalidatePath("/pecuaria/reproducao");
}
