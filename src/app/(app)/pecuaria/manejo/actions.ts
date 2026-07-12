"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { movementFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMovementAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(movementFields, formData);
  if (!data.date) return { error: "Informe a data." };
  if (!data.animalId && !data.loteId) {
    return { error: "Selecione um animal ou um lote." };
  }

  await prisma.managementMovement.create({
    data: data as Prisma.ManagementMovementUncheckedCreateInput,
  });

  revalidatePath("/pecuaria/manejo");
  redirect("/pecuaria/manejo");
}

export async function updateMovementAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(movementFields, formData);
  if (!data.date) return { error: "Informe a data." };
  if (!data.animalId && !data.loteId) {
    return { error: "Selecione um animal ou um lote." };
  }

  await prisma.managementMovement.update({
    where: { id },
    data: data as Prisma.ManagementMovementUncheckedUpdateInput,
  });

  revalidatePath("/pecuaria/manejo");
  redirect("/pecuaria/manejo");
}

export async function deleteMovementAction(id: string) {
  await prisma.managementMovement.delete({ where: { id } });
  revalidatePath("/pecuaria/manejo");
}
