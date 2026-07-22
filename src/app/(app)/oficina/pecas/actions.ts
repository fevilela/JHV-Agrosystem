"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getMechanicFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMechanicAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("oficina.pecas");
  const data = buildRecordData(getMechanicFields(t), formData);
  if (!data.name) return { error: t("errors.nameRequired") };

  try {
    await prisma.mechanic.create({
      data: { ...data, organizationId } as Prisma.MechanicUncheckedCreateInput,
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("oficina.pecas");
  const data = buildRecordData(getMechanicFields(t), formData);
  if (!data.name) return { error: t("errors.nameRequired") };

  try {
    await prisma.mechanic.updateMany({
      where: { id, organizationId },
      data: data as Prisma.MechanicUncheckedUpdateInput,
    });
  } catch {
    return { error: t("errors.duplicateCpf") };
  }

  revalidatePath("/oficina/pecas");
  redirect("/oficina/pecas");
}

export async function deleteMechanicAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.mechanic.deleteMany({ where: { id, organizationId } });
  revalidatePath("/oficina/pecas");
}
