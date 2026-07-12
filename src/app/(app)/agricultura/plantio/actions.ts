"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { plantioFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPlantioAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(plantioFields, formData);
  if (!data.safraId) return { error: "Selecione a safra." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.plantio.create({
    data: data as Prisma.PlantioUncheckedCreateInput,
  });

  revalidatePath("/agricultura/plantio");
  redirect("/agricultura/plantio");
}

export async function updatePlantioAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(plantioFields, formData);
  if (!data.safraId) return { error: "Selecione a safra." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.plantio.update({
    where: { id },
    data: data as Prisma.PlantioUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/plantio");
  redirect("/agricultura/plantio");
}

export async function deletePlantioAction(id: string) {
  await prisma.plantio.delete({ where: { id } });
  revalidatePath("/agricultura/plantio");
}
