"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { auditoriaFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createAuditoriaAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("auditoria");
  const data = buildRecordData(auditoriaFields, formData);
  if (!data.propriedadeProdutorId) return { error: "Selecione a propriedade auditada." };
  if (!data.dataAuditoria) return { error: "Informe a data da auditoria." };

  const auditoria = await prisma.auditoriaAgricola.create({
    data: { ...data, organizationId } as Prisma.AuditoriaAgricolaUncheckedCreateInput,
  });

  revalidatePath("/auditoria/auditorias");
  redirect(`/auditoria/auditorias/${auditoria.id}`);
}

export async function updateAuditoriaAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("auditoria");
  const data = buildRecordData(auditoriaFields, formData);
  if (!data.propriedadeProdutorId) return { error: "Selecione a propriedade auditada." };
  if (!data.dataAuditoria) return { error: "Informe a data da auditoria." };

  await prisma.auditoriaAgricola.updateMany({
    where: { id, organizationId },
    data: data as Prisma.AuditoriaAgricolaUncheckedUpdateInput,
  });

  revalidatePath(`/auditoria/auditorias/${id}`);
  revalidatePath("/auditoria/auditorias");
  redirect(`/auditoria/auditorias/${id}`);
}

export async function deleteAuditoriaAction(id: string) {
  const { organizationId } = await requireModule("auditoria");
  await prisma.auditoriaAgricola.deleteMany({ where: { id, organizationId } });
  revalidatePath("/auditoria/auditorias");
}

export async function addChecklistItemAction(auditoriaId: string, formData: FormData) {
  const { organizationId } = await requireModule("auditoria");
  const auditoria = await prisma.auditoriaAgricola.findFirst({ where: { id: auditoriaId, organizationId } });
  if (!auditoria) return;

  const descricao = (formData.get("descricao") as string | null)?.trim();
  if (!descricao) return;

  const conformidade = (formData.get("conformidade") as string | null) || "NAO_APLICAVEL";
  const evidenciaUrl = (formData.get("evidenciaUrl") as string | null)?.trim() || null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  await prisma.checklistItem.create({
    data: {
      auditoriaId,
      descricao,
      conformidade: conformidade as Prisma.ChecklistItemUncheckedCreateInput["conformidade"],
      evidenciaUrl,
      notes,
    },
  });

  revalidatePath(`/auditoria/auditorias/${auditoriaId}`);
}

export async function deleteChecklistItemAction(auditoriaId: string, itemId: string) {
  const { organizationId } = await requireModule("auditoria");
  const auditoria = await prisma.auditoriaAgricola.findFirst({ where: { id: auditoriaId, organizationId } });
  if (!auditoria) return;

  await prisma.checklistItem.deleteMany({ where: { id: itemId, auditoriaId } });
  revalidatePath(`/auditoria/auditorias/${auditoriaId}`);
}
