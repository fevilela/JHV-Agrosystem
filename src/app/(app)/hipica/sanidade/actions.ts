"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { equineHealthRecordFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createEquineHealthRecordAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(equineHealthRecordFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.equineHealthRecord.create({
    data: { ...data, organizationId } as Prisma.EquineHealthRecordUncheckedCreateInput,
  });

  revalidatePath("/hipica/sanidade");
  redirect("/hipica/sanidade");
}

export async function updateEquineHealthRecordAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("hipica");
  const data = buildRecordData(equineHealthRecordFields, formData);
  if (!data.animalId) return { error: "Selecione o animal." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.equineHealthRecord.updateMany({
    where: { id, organizationId },
    data: data as Prisma.EquineHealthRecordUncheckedUpdateInput,
  });

  revalidatePath("/hipica/sanidade");
  redirect("/hipica/sanidade");
}

export async function deleteEquineHealthRecordAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.equineHealthRecord.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/sanidade");
}
