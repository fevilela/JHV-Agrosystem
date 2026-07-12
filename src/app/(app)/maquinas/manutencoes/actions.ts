"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { maintenanceFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMaintenanceAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(maintenanceFields, formData);
  if (!data.machineId) return { error: "Selecione a máquina." };
  if (!data.date) return { error: "Informe a data." };

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
  const data = buildRecordData(maintenanceFields, formData);
  if (!data.machineId) return { error: "Selecione a máquina." };
  if (!data.date) return { error: "Informe a data." };

  await prisma.maintenance.update({
    where: { id },
    data: data as Prisma.MaintenanceUncheckedUpdateInput,
  });

  revalidatePath("/maquinas/manutencoes");
  redirect("/maquinas/manutencoes");
}

export async function deleteMaintenanceAction(id: string) {
  await prisma.maintenance.delete({ where: { id } });
  revalidatePath("/maquinas/manutencoes");
}
