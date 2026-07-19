"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { stallFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createStallAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(stallFields, formData);
  if (!data.code) return { error: "Informe o código da baia." };

  try {
    await prisma.stall.create({
      data: { ...data, organizationId } as Prisma.StallUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe uma baia com esse código." };
  }

  revalidatePath("/hipica/baia");
  redirect("/hipica/baia");
}

export async function updateStallAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(stallFields, formData);
  if (!data.code) return { error: "Informe o código da baia." };

  try {
    await prisma.stall.updateMany({
      where: { id, organizationId },
      data: data as Prisma.StallUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe uma baia com esse código." };
  }

  revalidatePath("/hipica/baia");
  redirect("/hipica/baia");
}

export async function deleteStallAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.stall.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/baia");
}

export async function occupyStallAction(stallId: string, formData: FormData) {
  const { organizationId } = await requireModule("hipica");
  const animalId = formData.get("animalId") as string | null;
  if (!animalId) return;

  const stall = await prisma.stall.findFirst({ where: { id: stallId, organizationId } });
  if (!stall) return;

  await prisma.$transaction([
    prisma.stall.update({
      where: { id: stallId },
      data: { status: "OCUPADA", currentAnimalId: animalId },
    }),
    prisma.stallEvent.create({
      data: {
        stallId,
        animalId,
        type: stall.currentAnimalId ? "TROCA" : "OCUPACAO",
      },
    }),
  ]);

  revalidatePath("/hipica/baia");
}

export async function vacateStallAction(stallId: string) {
  const { organizationId } = await requireModule("hipica");
  const stall = await prisma.stall.findFirst({ where: { id: stallId, organizationId } });
  if (!stall) return;

  await prisma.$transaction([
    prisma.stall.update({
      where: { id: stallId },
      data: { status: "LIVRE", currentAnimalId: null },
    }),
    prisma.stallEvent.create({
      data: {
        stallId,
        animalId: stall.currentAnimalId,
        type: "DESOCUPACAO",
      },
    }),
  ]);

  revalidatePath("/hipica/baia");
}

export async function markStallStatusAction(
  stallId: string,
  status: "LIMPEZA" | "MANUTENCAO" | "LIVRE"
) {
  const { organizationId } = await requireModule("hipica");
  const stall = await prisma.stall.findFirst({ where: { id: stallId, organizationId } });
  if (!stall) return;

  await prisma.$transaction([
    prisma.stall.update({ where: { id: stallId }, data: { status } }),
    prisma.stallEvent.create({
      data: {
        stallId,
        type: status === "LIVRE" ? "DESOCUPACAO" : status,
      },
    }),
  ]);

  revalidatePath("/hipica/baia");
}
