"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { trainingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTrainingAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(trainingFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.name) return { error: "Informe o nome do treinamento." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.training.create({
    data: data as Prisma.TrainingUncheckedCreateInput,
  });

  revalidatePath("/rh/treinamentos");
  redirect("/rh/treinamentos");
}

export async function updateTrainingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(trainingFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.name) return { error: "Informe o nome do treinamento." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.training.update({
    where: { id },
    data: data as Prisma.TrainingUncheckedUpdateInput,
  });

  revalidatePath("/rh/treinamentos");
  redirect("/rh/treinamentos");
}

export async function deleteTrainingAction(id: string) {
  await prisma.training.delete({ where: { id } });
  revalidatePath("/rh/treinamentos");
}
