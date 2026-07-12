"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { costCenterFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createCostCenterAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(costCenterFields, formData);
  if (!data.code) return { error: "Informe o código." };
  if (!data.name) return { error: "Informe o nome." };

  try {
    await prisma.costCenter.create({
      data: data as Prisma.CostCenterUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um centro de custo com esse código." };
  }

  revalidatePath("/financeiro/centro-custos");
  redirect("/financeiro/centro-custos");
}

export async function updateCostCenterAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(costCenterFields, formData);
  if (!data.code) return { error: "Informe o código." };
  if (!data.name) return { error: "Informe o nome." };

  try {
    await prisma.costCenter.update({
      where: { id },
      data: data as Prisma.CostCenterUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um centro de custo com esse código." };
  }

  revalidatePath("/financeiro/centro-custos");
  redirect("/financeiro/centro-custos");
}

export async function deleteCostCenterAction(id: string) {
  await prisma.costCenter.delete({ where: { id } });
  revalidatePath("/financeiro/centro-custos");
}
