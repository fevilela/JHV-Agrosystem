"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { dietFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createDietAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(dietFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };

  await prisma.animalDiet.create({
    data: { ...data, organizationId } as Prisma.AnimalDietUncheckedCreateInput,
  });

  revalidatePath("/hipica/nutricao");
  redirect("/hipica/nutricao");
}

export async function updateDietAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(dietFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };

  await prisma.animalDiet.updateMany({
    where: { id, organizationId },
    data: data as Prisma.AnimalDietUncheckedUpdateInput,
  });

  revalidatePath("/hipica/nutricao");
  redirect("/hipica/nutricao");
}

export async function deleteDietAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.animalDiet.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/nutricao");
}
