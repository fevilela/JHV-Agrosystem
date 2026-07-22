"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.armazenagem.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.storage.create({
      data: { ...data, organizationId } as Prisma.StorageUncheckedCreateInput,
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.armazenagem.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.code) return { error: t("codeRequired") };

  try {
    await prisma.storage.updateMany({
      where: { id, organizationId },
      data: data as Prisma.StorageUncheckedUpdateInput,
    });
  } catch {
    return { error: t("duplicateCode") };
  }

  revalidatePath("/agricultura/armazenagem");
  redirect("/agricultura/armazenagem");
}

export async function deleteStorageAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.storage.deleteMany({ where: { id, organizationId } });
  revalidatePath("/agricultura/armazenagem");
}

export async function createStorageMovementAction(
  storageId: string,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const storage = await prisma.storage.findFirst({ where: { id: storageId, organizationId } });
  if (!storage) return;

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
  const { organizationId } = await requireOrg();
  await prisma.storageMovement.deleteMany({ where: { id, storage: { id: storageId, organizationId } } });
  revalidatePath(`/agricultura/armazenagem/${storageId}`);
}
