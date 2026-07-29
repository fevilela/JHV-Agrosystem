"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { mudaEspecieFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMudaEspecieAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaEspecieFields, formData);
  if (!data.nomePopular) return { error: "Informe o nome popular." };

  await prisma.mudaEspecie.create({
    data: { ...data, organizationId } as Prisma.MudaEspecieUncheckedCreateInput,
  });

  revalidatePath("/viveiro/especies");
  redirect("/viveiro/especies");
}

export async function updateMudaEspecieAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaEspecieFields, formData);
  if (!data.nomePopular) return { error: "Informe o nome popular." };

  await prisma.mudaEspecie.updateMany({
    where: { id, organizationId },
    data: data as Prisma.MudaEspecieUncheckedUpdateInput,
  });

  revalidatePath("/viveiro/especies");
  redirect("/viveiro/especies");
}

export async function deleteMudaEspecieAction(id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaEspecie.deleteMany({ where: { id, organizationId } });
  revalidatePath("/viveiro/especies");
}
