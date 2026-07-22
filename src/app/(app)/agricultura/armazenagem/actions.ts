"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getStorageFields, getStorageMovementFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("agricultura.armazenagem.fields");
  const tType = await getTranslations("labels.storageType");
  return getStorageFields(tf, tType);
}

async function getMovementFields() {
  const tf = await getTranslations("agricultura.armazenagem");
  const tMovementType = await getTranslations("labels.storageMovementType");
  return getStorageMovementFields(tf, tMovementType);
}

export async function createStorageAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("agricultura.armazenagem.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.storage.create({
      data: data as Prisma.StorageUncheckedCreateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/agricultura/armazenagem");
  redirect("/agricultura/armazenagem");
}

export async function updateStorageAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("agricultura.armazenagem.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.storage.update({
      where: { id },
      data: data as Prisma.StorageUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
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
  const data = buildRecordData(await getMovementFields(), formData);
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
