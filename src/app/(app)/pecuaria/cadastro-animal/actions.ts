"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { livestockAnimalFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createLivestockAnimalAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(livestockAnimalFields, formData);
  if (!data.brinco) return { error: "Informe o brinco do animal." };
  if (!data.category) return { error: "Selecione a categoria." };

  try {
    await prisma.livestockAnimal.create({
      data: data as Prisma.LivestockAnimalUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um animal com esse brinco ou RFID." };
  }

  revalidatePath("/pecuaria/cadastro-animal");
  redirect("/pecuaria/cadastro-animal");
}

export async function updateLivestockAnimalAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(livestockAnimalFields, formData);
  if (!data.brinco) return { error: "Informe o brinco do animal." };
  if (!data.category) return { error: "Selecione a categoria." };

  try {
    await prisma.livestockAnimal.update({
      where: { id },
      data: data as Prisma.LivestockAnimalUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um animal com esse brinco ou RFID." };
  }

  revalidatePath("/pecuaria/cadastro-animal");
  redirect("/pecuaria/cadastro-animal");
}

export async function deleteLivestockAnimalAction(id: string) {
  await prisma.livestockAnimal.delete({ where: { id } });
  revalidatePath("/pecuaria/cadastro-animal");
}
