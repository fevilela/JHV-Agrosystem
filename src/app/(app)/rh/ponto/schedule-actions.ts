"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { scheduleFields } from "./schedule-fields";

type FormState = { error?: string } | undefined;

export async function createScheduleAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(scheduleFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.startDate) return { error: "Informe a data de início." };

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
  const data = buildRecordData(scheduleFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.startDate) return { error: "Informe a data de início." };

  await prisma.schedule.update({
    where: { id },
    data: data as Prisma.ScheduleUncheckedUpdateInput,
  });

  revalidatePath("/rh/ponto/escalas");
  redirect("/rh/ponto/escalas");
}

export async function deleteScheduleAction(id: string) {
  await prisma.schedule.delete({ where: { id } });
  revalidatePath("/rh/ponto/escalas");
}
