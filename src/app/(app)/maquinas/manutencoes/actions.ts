"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getMaintenanceFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("maquinas.manutencoes");
  const tType = await getTranslations("labels.maintenanceType");
  return { t, fields: getMaintenanceFields(t, tType) };
}

export async function createMaintenanceAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.machineId) return { error: t("errors.machineRequired") };
  if (!data.date) return { error: t("errors.dateRequired") };

  const machine = await prisma.machine.findFirst({
    where: { id: data.machineId as string, organizationId },
  });
  if (!machine) return { error: t("errors.machineRequired") };

  await prisma.maintenance.create({
    data: data as Prisma.MaintenanceUncheckedCreateInput,
  });

  revalidatePath("/maquinas/manutencoes");
  redirect("/maquinas/manutencoes");
}

export async function updateMaintenanceAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.machineId) return { error: t("errors.machineRequired") };
  if (!data.date) return { error: t("errors.dateRequired") };

  await prisma.maintenance.updateMany({
    where: { id, machine: { organizationId } },
    data: data as Prisma.MaintenanceUncheckedUpdateInput,
  });

  revalidatePath("/maquinas/manutencoes");
  redirect("/maquinas/manutencoes");
}

export async function deleteMaintenanceAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.maintenance.deleteMany({ where: { id, machine: { organizationId } } });
  revalidatePath("/maquinas/manutencoes");
}
