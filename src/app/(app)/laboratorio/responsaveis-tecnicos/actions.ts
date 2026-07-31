"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { responsavelTecnicoCreateFields, responsavelTecnicoEditFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createResponsavelTecnicoAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(responsavelTecnicoCreateFields, formData);
  if (!data.employeeId) return { error: "Selecione o funcionário." };
  if (!data.registroProfissional) return { error: "Informe o registro profissional." };

  const employee = await prisma.employee.findFirst({
    where: { id: data.employeeId as string, organizationId },
  });
  if (!employee) return { error: "Funcionário inválido." };

  try {
    await prisma.responsavelTecnico.create({
      data: { ...data, organizationId } as Prisma.ResponsavelTecnicoUncheckedCreateInput,
    });
  } catch {
    return { error: "Esse funcionário já está cadastrado como responsável técnico." };
  }

  revalidatePath("/laboratorio/responsaveis-tecnicos");
  redirect("/laboratorio/responsaveis-tecnicos");
}

export async function updateResponsavelTecnicoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(responsavelTecnicoEditFields, formData);
  if (!data.registroProfissional) return { error: "Informe o registro profissional." };

  await prisma.responsavelTecnico.updateMany({
    where: { id, organizationId },
    data: data as Prisma.ResponsavelTecnicoUncheckedUpdateInput,
  });

  revalidatePath("/laboratorio/responsaveis-tecnicos");
  redirect("/laboratorio/responsaveis-tecnicos");
}

export async function deleteResponsavelTecnicoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.responsavelTecnico.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/responsaveis-tecnicos");
}
