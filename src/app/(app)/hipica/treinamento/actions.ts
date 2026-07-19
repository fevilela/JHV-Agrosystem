"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { trainingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTrainingAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(trainingFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.trainingSession.create({
    data: { ...data, organizationId } as Prisma.TrainingSessionUncheckedCreateInput,
  });

  revalidatePath("/hipica/treinamento");
  redirect("/hipica/treinamento");
}

export async function updateTrainingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(trainingFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.trainingSession.updateMany({
    where: { id, organizationId },
    data: data as Prisma.TrainingSessionUncheckedUpdateInput,
  });

  revalidatePath("/hipica/treinamento");
  redirect("/hipica/treinamento");
}

export async function deleteTrainingAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.trainingSession.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/treinamento");
}
