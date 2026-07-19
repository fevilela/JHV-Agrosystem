"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { piqueteFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createPiqueteAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(piqueteFields, formData);
  if (!data.code) return { error: "Informe o código do piquete." };

  try {
    await prisma.piquete.create({
      data: { ...data, organizationId } as Prisma.PiqueteUncheckedCreateInput,
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
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(piqueteFields, formData);
  if (!data.code) return { error: "Informe o código do piquete." };

  try {
    await prisma.piquete.updateMany({
      where: { id, organizationId },
      data: data as Prisma.PiqueteUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um piquete com esse código." };
  }

  revalidatePath("/hipica/piquetes");
  redirect("/hipica/piquetes");
}

export async function deletePiqueteAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.piquete.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/piquetes");
}

export async function occupyPiqueteAction(piqueteId: string, formData: FormData) {
  const { organizationId } = await requireModule("hipica");
  const animalId = formData.get("animalId") as string | null;
  if (!animalId) return;

  const piquete = await prisma.piquete.findFirst({ where: { id: piqueteId, organizationId } });
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
  const { organizationId } = await requireModule("hipica");
  const piquete = await prisma.piquete.findFirst({ where: { id: piqueteId, organizationId } });
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
  const { organizationId } = await requireModule("hipica");
  const piquete = await prisma.piquete.findFirst({ where: { id: piqueteId, organizationId } });
  if (!piquete) return;

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
