"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { machineFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMachineAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(machineFields, formData);
  if (!data.type) return { error: "Selecione o tipo de máquina." };

  try {
    await prisma.machine.create({
      data: data as Prisma.MachineUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe uma máquina com essa placa/número de série." };
  }

  revalidatePath("/maquinas/cadastro");
  redirect("/maquinas/cadastro");
}

export async function updateMachineAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(machineFields, formData);
  if (!data.type) return { error: "Selecione o tipo de máquina." };

  try {
    await prisma.machine.update({
      where: { id },
      data: data as Prisma.MachineUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe uma máquina com essa placa/número de série." };
  }

  revalidatePath("/maquinas/cadastro");
  redirect("/maquinas/cadastro");
}

export async function deleteMachineAction(id: string) {
  await prisma.machine.delete({ where: { id } });
  revalidatePath("/maquinas/cadastro");
}
