"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getMechanicFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMechanicAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("oficina.pecas");
  const data = buildRecordData(getMechanicFields(t), formData);
  if (!data.name) return { error: t("errors.nameRequired") };

  try {
    await prisma.mechanic.create({
      data: data as Prisma.MechanicUncheckedCreateInput,
    });
  } catch {
    return { error: t("errors.duplicateCpf") };
  }

  revalidatePath("/oficina/pecas");
  redirect("/oficina/pecas");
}

export async function updateMechanicAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("oficina.pecas");
  const data = buildRecordData(getMechanicFields(t), formData);
  if (!data.name) return { error: t("errors.nameRequired") };

  try {
    await prisma.mechanic.update({
      where: { id },
      data: data as Prisma.MechanicUncheckedUpdateInput,
    });
  } catch {
    return { error: t("errors.duplicateCpf") };
  }

  revalidatePath("/oficina/pecas");
  redirect("/oficina/pecas");
}

export async function deleteMechanicAction(id: string) {
  await prisma.mechanic.delete({ where: { id } });
  revalidatePath("/oficina/pecas");
}
