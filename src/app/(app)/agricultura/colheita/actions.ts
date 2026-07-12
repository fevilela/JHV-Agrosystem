"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { harvestFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createHarvestAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(harvestFields, formData);
  if (!data.safraId) return { error: "Selecione a safra." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.$transaction([
    prisma.harvest.create({
      data: data as Prisma.HarvestUncheckedCreateInput,
    }),
    prisma.safra.update({
      where: { id: data.safraId as string },
      data: { status: "COLHIDA" },
    }),
  ]);

  revalidatePath("/agricultura/colheita");
  revalidatePath("/agricultura/safra");
  redirect("/agricultura/colheita");
}

export async function updateHarvestAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(harvestFields, formData);
  if (!data.safraId) return { error: "Selecione a safra." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.harvest.update({
    where: { id },
    data: data as Prisma.HarvestUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/colheita");
  redirect("/agricultura/colheita");
}

export async function deleteHarvestAction(id: string) {
  await prisma.harvest.delete({ where: { id } });
  revalidatePath("/agricultura/colheita");
}
