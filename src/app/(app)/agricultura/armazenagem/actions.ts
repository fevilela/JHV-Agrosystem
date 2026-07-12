"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { storageFields, storageMovementFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createStorageAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(storageFields, formData);
  if (!data.code) return { error: "Informe o código." };

  try {
    await prisma.storage.create({
      data: data as Prisma.StorageUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um silo/armazém com esse código." };
  }

  revalidatePath("/agricultura/armazenagem");
  redirect("/agricultura/armazenagem");
}

export async function updateStorageAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(storageFields, formData);
  if (!data.code) return { error: "Informe o código." };

  try {
    await prisma.storage.update({
      where: { id },
      data: data as Prisma.StorageUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um silo/armazém com esse código." };
  }

  revalidatePath("/agricultura/armazenagem");
  redirect("/agricultura/armazenagem");
}

export async function deleteStorageAction(id: string) {
  await prisma.storage.delete({ where: { id } });
  revalidatePath("/agricultura/armazenagem");
}

export async function createStorageMovementAction(
  storageId: string,
  formData: FormData
) {
  const data = buildRecordData(storageMovementFields, formData);
  if (!data.type || !data.date || !data.quantityTon) return;

  await prisma.storageMovement.create({
    data: {
      ...data,
      storageId,
    } as Prisma.StorageMovementUncheckedCreateInput,
  });

  revalidatePath(`/agricultura/armazenagem/${storageId}`);
}

export async function deleteStorageMovementAction(
  storageId: string,
  id: string
) {
  await prisma.storageMovement.delete({ where: { id } });
  revalidatePath(`/agricultura/armazenagem/${storageId}`);
}
