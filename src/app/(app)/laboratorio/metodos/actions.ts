"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { metodoAnaliticoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMetodoAnaliticoAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(metodoAnaliticoFields, formData);
  if (!data.nomeParametro) return { error: "Informe o nome do parâmetro." };

  await prisma.metodoAnalitico.create({
    data: { ...data, organizationId } as Prisma.MetodoAnaliticoUncheckedCreateInput,
  });

  revalidatePath("/laboratorio/metodos");
  redirect("/laboratorio/metodos");
}

export async function updateMetodoAnaliticoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(metodoAnaliticoFields, formData);
  if (!data.nomeParametro) return { error: "Informe o nome do parâmetro." };

  await prisma.metodoAnalitico.updateMany({
    where: { id, organizationId },
    data: data as Prisma.MetodoAnaliticoUncheckedUpdateInput,
  });

  revalidatePath("/laboratorio/metodos");
  redirect("/laboratorio/metodos");
}

export async function deleteMetodoAnaliticoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.metodoAnalitico.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/metodos");
}
