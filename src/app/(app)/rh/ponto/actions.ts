"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getAttendanceFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("rh.ponto.fields");
  const tStatus = await getTranslations("labels.attendanceStatus");
  return getAttendanceFields(tf, tStatus);
}

export async function createAttendanceAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("rh.ponto.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const employee = await prisma.employee.findFirst({
    where: { id: data.employeeId as string, organizationId },
  });
  if (!employee) return { error: t("employeeRequired") };

  await prisma.attendance.create({
    data: data as Prisma.AttendanceUncheckedCreateInput,
  });

  revalidatePath("/rh/ponto");
  redirect("/rh/ponto");
}

export async function updateAttendanceAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("rh.ponto.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.attendance.updateMany({
    where: { id, employee: { organizationId } },
    data: data as Prisma.AttendanceUncheckedUpdateInput,
  });

  revalidatePath("/rh/ponto");
  redirect("/rh/ponto");
}

export async function deleteAttendanceAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.attendance.deleteMany({ where: { id, employee: { organizationId } } });
  revalidatePath("/rh/ponto");
}
