"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { attendanceFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createAttendanceAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(attendanceFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.date) return { error: "Informe a data." };

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
  const data = buildRecordData(attendanceFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.date) return { error: "Informe a data." };

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
