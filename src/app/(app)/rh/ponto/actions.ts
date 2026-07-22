"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  const t = await getTranslations("rh.ponto.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
  const t = await getTranslations("rh.ponto.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.attendance.update({
    where: { id },
    data: data as Prisma.AttendanceUncheckedUpdateInput,
  });

  revalidatePath("/rh/ponto");
  redirect("/rh/ponto");
}

export async function deleteAttendanceAction(id: string) {
  await prisma.attendance.delete({ where: { id } });
  revalidatePath("/rh/ponto");
}
