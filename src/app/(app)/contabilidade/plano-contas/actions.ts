"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { chartAccountFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createChartAccountAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(chartAccountFields, formData);
  if (!data.code) return { error: "Informe o código da conta." };
  if (!data.name) return { error: "Informe o nome da conta." };
  if (!data.type) return { error: "Selecione o tipo." };
  if (!data.nature) return { error: "Selecione a natureza." };

  try {
    await prisma.chartAccount.create({
      data: data as Prisma.ChartAccountUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe uma conta com esse código." };
  }

  revalidatePath("/contabilidade/plano-contas");
  redirect("/contabilidade/plano-contas");
}

export async function updateChartAccountAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(chartAccountFields, formData);
  if (!data.code) return { error: "Informe o código da conta." };
  if (!data.name) return { error: "Informe o nome da conta." };
  if (!data.type) return { error: "Selecione o tipo." };
  if (!data.nature) return { error: "Selecione a natureza." };

  if (data.parentId === id) {
    return { error: "Uma conta não pode ser pai dela mesma." };
  }

  try {
    await prisma.chartAccount.update({
      where: { id },
      data: data as Prisma.ChartAccountUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe uma conta com esse código." };
  }

  revalidatePath("/contabilidade/plano-contas");
  redirect("/contabilidade/plano-contas");
}

export async function deleteChartAccountAction(id: string) {
  await prisma.chartAccount.delete({ where: { id } });
  revalidatePath("/contabilidade/plano-contas");
}
