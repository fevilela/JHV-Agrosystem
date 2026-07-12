"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { epiFields } from "./epi-fields";

type FormState = { error?: string } | undefined;

export async function createEpiAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(epiFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.itemName) return { error: "Informe o EPI." };
  if (!data.issueDate) return { error: "Informe a data de entrega." };

  await prisma.epiIssuance.create({
    data: data as Prisma.EpiIssuanceUncheckedCreateInput,
  });

  revalidatePath("/rh/treinamentos/epis");
  redirect("/rh/treinamentos/epis");
}

export async function updateEpiAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(epiFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.itemName) return { error: "Informe o EPI." };
  if (!data.issueDate) return { error: "Informe a data de entrega." };

  await prisma.epiIssuance.update({
    where: { id },
    data: data as Prisma.EpiIssuanceUncheckedUpdateInput,
  });

  revalidatePath("/rh/treinamentos/epis");
  redirect("/rh/treinamentos/epis");
}

export async function deleteEpiAction(id: string) {
  await prisma.epiIssuance.delete({ where: { id } });
  revalidatePath("/rh/treinamentos/epis");
}
