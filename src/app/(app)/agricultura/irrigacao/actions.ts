"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { irrigationFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createIrrigationAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(irrigationFields, formData);
  if (!data.talhaoId) return { error: "Selecione o talhão." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.irrigation.create({
    data: data as Prisma.IrrigationUncheckedCreateInput,
  });

  revalidatePath("/agricultura/irrigacao");
  redirect("/agricultura/irrigacao");
}

export async function updateIrrigationAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(irrigationFields, formData);
  if (!data.talhaoId) return { error: "Selecione o talhão." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.irrigation.update({
    where: { id },
    data: data as Prisma.IrrigationUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/irrigacao");
  redirect("/agricultura/irrigacao");
}

export async function deleteIrrigationAction(id: string) {
  await prisma.irrigation.delete({ where: { id } });
  revalidatePath("/agricultura/irrigacao");
}
