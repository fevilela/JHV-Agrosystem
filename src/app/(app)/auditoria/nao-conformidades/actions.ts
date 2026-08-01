"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { naoConformidadeFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createNaoConformidadeAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("auditoria");
  const data = buildRecordData(naoConformidadeFields, formData);
  if (!data.descricao) return { error: "Informe a descrição." };
  if (!data.severidade) return { error: "Selecione a severidade." };

  await prisma.naoConformidade.create({
    data: { ...data, organizationId } as Prisma.NaoConformidadeUncheckedCreateInput,
  });

  revalidatePath("/auditoria/nao-conformidades");
  redirect("/auditoria/nao-conformidades");
}

export async function updateNaoConformidadeAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("auditoria");
  const data = buildRecordData(naoConformidadeFields, formData);
  if (!data.descricao) return { error: "Informe a descrição." };
  if (!data.severidade) return { error: "Selecione a severidade." };

  await prisma.naoConformidade.updateMany({
    where: { id, organizationId },
    data: data as Prisma.NaoConformidadeUncheckedUpdateInput,
  });

  revalidatePath("/auditoria/nao-conformidades");
  redirect("/auditoria/nao-conformidades");
}

export async function deleteNaoConformidadeAction(id: string) {
  const { organizationId } = await requireModule("auditoria");
  await prisma.naoConformidade.deleteMany({ where: { id, organizationId } });
  revalidatePath("/auditoria/nao-conformidades");
}
