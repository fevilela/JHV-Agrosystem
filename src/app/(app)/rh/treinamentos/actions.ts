"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getTrainingFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createTrainingAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("rh.treinamentos.errors");
  const tf = await getTranslations("rh.treinamentos.fields");
  const data = buildRecordData(getTrainingFields(tf), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.name) return { error: t("nameRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const employee = await prisma.employee.findFirst({
    where: { id: data.employeeId as string, organizationId },
  });
  if (!employee) return { error: t("employeeRequired") };

  await prisma.training.create({
    data: data as Prisma.TrainingUncheckedCreateInput,
  });

  revalidatePath("/rh/treinamentos");
  redirect("/rh/treinamentos");
}

export async function updateTrainingAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("rh.treinamentos.errors");
  const tf = await getTranslations("rh.treinamentos.fields");
  const data = buildRecordData(getTrainingFields(tf), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.name) return { error: t("nameRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.training.updateMany({
    where: { id, employee: { organizationId } },
    data: data as Prisma.TrainingUncheckedUpdateInput,
  });

  revalidatePath("/rh/treinamentos");
  redirect("/rh/treinamentos");
}

export async function deleteTrainingAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.training.deleteMany({ where: { id, employee: { organizationId } } });
  revalidatePath("/rh/treinamentos");
}
