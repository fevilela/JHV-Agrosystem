"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { equipamentoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createEquipamentoAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(equipamentoFields, formData);
  if (!data.nome) return { error: "Informe o nome do equipamento." };

  await prisma.equipamento.create({
    data: { ...data, organizationId } as Prisma.EquipamentoUncheckedCreateInput,
  });

  revalidatePath("/laboratorio/equipamentos");
  redirect("/laboratorio/equipamentos");
}

export async function updateEquipamentoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(equipamentoFields, formData);
  if (!data.nome) return { error: "Informe o nome do equipamento." };

  await prisma.equipamento.updateMany({
    where: { id, organizationId },
    data: data as Prisma.EquipamentoUncheckedUpdateInput,
  });

  revalidatePath(`/laboratorio/equipamentos/${id}`);
  revalidatePath("/laboratorio/equipamentos");
  redirect(`/laboratorio/equipamentos/${id}`);
}

export async function deleteEquipamentoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.equipamento.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/equipamentos");
}

export async function createManutencaoAction(equipamentoId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const equipamento = await prisma.equipamento.findFirst({ where: { id: equipamentoId, organizationId } });
  if (!equipamento) return;

  const descricao = (formData.get("descricao") as string | null)?.trim() || null;
  const responsavel = (formData.get("responsavel") as string | null)?.trim() || null;

  await prisma.equipamentoManutencao.create({
    data: { equipamentoId, descricao, responsavel },
  });

  revalidatePath(`/laboratorio/equipamentos/${equipamentoId}`);
}
