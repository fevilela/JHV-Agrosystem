"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getLivestockAnimalFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("pecuaria.cadastroAnimal.fields");
  const tSexo = await getTranslations("labels.animalSexo");
  const tCategory = await getTranslations("labels.livestockCategory");
  const tStatus = await getTranslations("labels.livestockStatus");
  return getLivestockAnimalFields(tf, tSexo, tCategory, tStatus);
}

export async function createLivestockAnimalAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.cadastroAnimal.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.brinco) return { error: t("brincoRequired") };
  if (!data.category) return { error: t("categoryRequired") };

  try {
    await prisma.livestockAnimal.create({
      data: data as Prisma.LivestockAnimalUncheckedCreateInput,
    });
  } catch {
    return { error: t("duplicateBrinco") };
  }

  revalidatePath("/pecuaria/cadastro-animal");
  redirect("/pecuaria/cadastro-animal");
}

export async function updateLivestockAnimalAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("pecuaria.cadastroAnimal.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.brinco) return { error: t("brincoRequired") };
  if (!data.category) return { error: t("categoryRequired") };

  try {
    await prisma.livestockAnimal.update({
      where: { id },
      data: data as Prisma.LivestockAnimalUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateBrinco") };
  }

  revalidatePath("/pecuaria/cadastro-animal");
  redirect("/pecuaria/cadastro-animal");
}

export async function deleteLivestockAnimalAction(id: string) {
  await prisma.livestockAnimal.delete({ where: { id } });
  revalidatePath("/pecuaria/cadastro-animal");
}
