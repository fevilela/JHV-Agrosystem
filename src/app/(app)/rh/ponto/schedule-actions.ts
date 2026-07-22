"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getScheduleFields } from "./schedule-fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("rh.escalas.fields");
  const tShift = await getTranslations("labels.scheduleShift");
  return getScheduleFields(tf, tShift);
}

export async function createScheduleAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("rh.escalas.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.startDate) return { error: t("startDateRequired") };

  const employee = await prisma.employee.findFirst({
    where: { id: data.employeeId as string, organizationId },
  });
  if (!employee) return { error: t("employeeRequired") };

  await prisma.schedule.create({
    data: data as Prisma.ScheduleUncheckedCreateInput,
  });

  revalidatePath("/rh/ponto/escalas");
  redirect("/rh/ponto/escalas");
}

export async function updateScheduleAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("rh.escalas.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.startDate) return { error: t("startDateRequired") };

  await prisma.schedule.updateMany({
    where: { id, employee: { organizationId } },
    data: data as Prisma.ScheduleUncheckedUpdateInput,
  });

  revalidatePath("/rh/ponto/escalas");
  redirect("/rh/ponto/escalas");
}

export async function deleteScheduleAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.schedule.deleteMany({ where: { id, employee: { organizationId } } });
  revalidatePath("/rh/ponto/escalas");
}
