"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { usageLogFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createUsageLogAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(usageLogFields, formData);
  if (!data.machineId) return { error: "Selecione a máquina." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.horimetro) return { error: "Informe o horímetro." };

  await prisma.$transaction([
    prisma.usageLog.create({
      data: data as Prisma.UsageLogUncheckedCreateInput,
    }),
    prisma.machine.update({
      where: { id: data.machineId as string },
      data: { horimetroAtual: data.horimetro as Prisma.Decimal | number },
    }),
  ]);

  revalidatePath("/maquinas/controle");
  revalidatePath("/maquinas/cadastro");
  redirect("/maquinas/controle");
}

export async function updateUsageLogAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(usageLogFields, formData);
  if (!data.machineId) return { error: "Selecione a máquina." };
  if (!data.date) return { error: "Informe a data." };
  if (!data.horimetro) return { error: "Informe o horímetro." };

  await prisma.usageLog.update({
    where: { id },
    data: data as Prisma.UsageLogUncheckedUpdateInput,
  });

  revalidatePath("/maquinas/controle");
  redirect("/maquinas/controle");
}

export async function deleteUsageLogAction(id: string) {
  await prisma.usageLog.delete({ where: { id } });
  revalidatePath("/maquinas/controle");
}
