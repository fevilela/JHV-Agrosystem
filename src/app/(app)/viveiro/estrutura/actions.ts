"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { viveiroFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createViveiroAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(viveiroFields, formData);
  if (!data.code) return { error: "Informe o código do viveiro." };
  if (!data.name) return { error: "Informe o nome do viveiro." };

  try {
    await prisma.viveiro.create({
      data: { ...data, organizationId } as Prisma.ViveiroUncheckedCreateInput,
    });
  } catch {
    return { error: "Já existe um viveiro com esse código." };
  }

  revalidatePath("/viveiro/estrutura");
  redirect("/viveiro/estrutura");
}

export async function updateViveiroAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(viveiroFields, formData);
  if (!data.code) return { error: "Informe o código do viveiro." };
  if (!data.name) return { error: "Informe o nome do viveiro." };

  try {
    await prisma.viveiro.updateMany({
      where: { id, organizationId },
      data: data as Prisma.ViveiroUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe um viveiro com esse código." };
  }

  revalidatePath("/viveiro/estrutura");
  redirect("/viveiro/estrutura");
}

export async function deleteViveiroAction(id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.viveiro.deleteMany({ where: { id, organizationId } });
  revalidatePath("/viveiro/estrutura");
}
