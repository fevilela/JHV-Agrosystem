"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getMachineFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("maquinas.cadastro");
  const tType = await getTranslations("labels.machineType");
  const tStatus = await getTranslations("labels.machineStatus");
  return { t, fields: getMachineFields(t, tType, tStatus) };
}

export async function createMachineAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.type) return { error: t("errors.typeRequired") };

  try {
    await prisma.machine.create({
      data: { ...data, organizationId } as Prisma.MachineUncheckedCreateInput,
    });
  } catch {
    return { error: t("errors.duplicatePlate") };
  }

  revalidatePath("/maquinas/cadastro");
  redirect("/maquinas/cadastro");
}

export async function updateMachineAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.type) return { error: t("errors.typeRequired") };

  try {
    await prisma.machine.updateMany({
      where: { id, organizationId },
      data: data as Prisma.MachineUncheckedUpdateInput,
    });
  } catch {
    return { error: t("errors.duplicatePlate") };
  }

  revalidatePath("/maquinas/cadastro");
  redirect("/maquinas/cadastro");
}

export async function deleteMachineAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.machine.deleteMany({ where: { id, organizationId } });
  revalidatePath("/maquinas/cadastro");
}
