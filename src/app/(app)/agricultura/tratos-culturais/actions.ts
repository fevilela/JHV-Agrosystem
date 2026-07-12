"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { tratoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTratoAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(tratoFields, formData);
  if (!data.safraId) return { error: "Selecione a safra." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.tratoCultural.create({
    data: data as Prisma.TratoCulturalUncheckedCreateInput,
  });

  revalidatePath("/agricultura/tratos-culturais");
  redirect("/agricultura/tratos-culturais");
}

export async function updateTratoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(tratoFields, formData);
  if (!data.safraId) return { error: "Selecione a safra." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.tratoCultural.update({
    where: { id },
    data: data as Prisma.TratoCulturalUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/tratos-culturais");
  redirect("/agricultura/tratos-culturais");
}

export async function deleteTratoAction(id: string) {
  await prisma.tratoCultural.delete({ where: { id } });
  revalidatePath("/agricultura/tratos-culturais");
}
