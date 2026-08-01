"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { acreditacaoFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createAcreditacaoAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(acreditacaoFields, formData);

  const acreditacao = await prisma.acreditacaoLaboratorio.create({
    data: { ...data, organizationId } as Prisma.AcreditacaoLaboratorioUncheckedCreateInput,
  });

  revalidatePath("/laboratorio/acreditacao");
  redirect(`/laboratorio/acreditacao/${acreditacao.id}`);
}

export async function updateAcreditacaoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(acreditacaoFields, formData);

  await prisma.acreditacaoLaboratorio.updateMany({
    where: { id, organizationId },
    data: data as Prisma.AcreditacaoLaboratorioUncheckedUpdateInput,
  });

  revalidatePath(`/laboratorio/acreditacao/${id}`);
  revalidatePath("/laboratorio/acreditacao");
  redirect(`/laboratorio/acreditacao/${id}`);
}

export async function deleteAcreditacaoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.acreditacaoLaboratorio.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/acreditacao");
}

export async function addAuditoriaEventoAction(acreditacaoId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const acreditacao = await prisma.acreditacaoLaboratorio.findFirst({
    where: { id: acreditacaoId, organizationId },
  });
  if (!acreditacao) return;

  const resultado = (formData.get("resultado") as string | null)?.trim() || null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  await prisma.acreditacaoAuditoriaEvento.create({
    data: { acreditacaoLaboratorioId: acreditacaoId, resultado, notes },
  });

  revalidatePath(`/laboratorio/acreditacao/${acreditacaoId}`);
}

export async function toggleParametroAcreditadoAction(metodoId: string, acreditado: boolean) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.metodoAnalitico.updateMany({ where: { id: metodoId, organizationId }, data: { acreditado } });
  revalidatePath("/laboratorio/acreditacao");
}
