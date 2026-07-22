"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getUsageLogFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createUsageLogAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("maquinas.controle");
  const data = buildRecordData(getUsageLogFields(t), formData);
  if (!data.machineId) return { error: t("errors.machineRequired") };
  if (!data.date) return { error: t("errors.dateRequired") };
  if (!data.horimetro) return { error: t("errors.horimeterRequired") };

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
  const t = await getTranslations("maquinas.controle");
  const data = buildRecordData(getUsageLogFields(t), formData);
  if (!data.machineId) return { error: t("errors.machineRequired") };
  if (!data.date) return { error: t("errors.dateRequired") };
  if (!data.horimetro) return { error: t("errors.horimeterRequired") };

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
