"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { piqueteFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPiqueteAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(piqueteFields, formData);
  if (!data.code) return { error: "Informe o código do piquete." };

  try {
    await prisma.piquete.create({
      data: data as Prisma.PiqueteUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um piquete com esse código." };
  }

  revalidatePath("/hipica/piquetes");
  redirect("/hipica/piquetes");
}

export async function updatePiqueteAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(piqueteFields, formData);
  if (!data.code) return { error: "Informe o código do piquete." };

  try {
    await prisma.piquete.update({
      where: { id },
      data: data as Prisma.PiqueteUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um piquete com esse código." };
  }

  revalidatePath("/hipica/piquetes");
  redirect("/hipica/piquetes");
}

export async function deletePiqueteAction(id: string) {
  await prisma.piquete.delete({ where: { id } });
  revalidatePath("/hipica/piquetes");
}

export async function occupyPiqueteAction(piqueteId: string, formData: FormData) {
  const animalId = formData.get("animalId") as string | null;
  if (!animalId) return;

  const piquete = await prisma.piquete.findUnique({ where: { id: piqueteId } });
  if (!piquete) return;

  await prisma.$transaction([
    prisma.piquete.update({
      where: { id: piqueteId },
      data: { status: "OCUPADO", currentAnimalId: animalId },
    }),
    prisma.piqueteEvent.create({
      data: {
        piqueteId,
        animalId,
        type: piquete.currentAnimalId ? "TROCA" : "OCUPACAO",
      },
    }),
  ]);

  revalidatePath("/hipica/piquetes");
}

export async function vacatePiqueteAction(piqueteId: string) {
  const piquete = await prisma.piquete.findUnique({ where: { id: piqueteId } });
  if (!piquete) return;

  await prisma.$transaction([
    prisma.piquete.update({
      where: { id: piqueteId },
      data: { status: "LIVRE", currentAnimalId: null },
    }),
    prisma.piqueteEvent.create({
      data: {
        piqueteId,
        animalId: piquete.currentAnimalId,
        type: "DESOCUPACAO",
      },
    }),
  ]);

  revalidatePath("/hipica/piquetes");
}

export async function markPiqueteStatusAction(
  piqueteId: string,
  status: "MANUTENCAO" | "LIVRE"
) {
  await prisma.$transaction([
    prisma.piquete.update({ where: { id: piqueteId }, data: { status } }),
    prisma.piqueteEvent.create({
      data: {
        piqueteId,
        type: status === "LIVRE" ? "DESOCUPACAO" : status,
      },
    }),
  ]);

  revalidatePath("/hipica/piquetes");
}
