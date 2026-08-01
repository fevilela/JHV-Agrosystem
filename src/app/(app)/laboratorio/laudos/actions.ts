"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/tenant";

type FormState = { error?: string } | undefined;

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function amostraIds(formData: FormData) {
  return formData.getAll("amostraIds").map(String).filter(Boolean);
}

export async function createLaudoAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const numero = str(formData, "numero");
  const produtorId = str(formData, "produtorId");
  const responsavelAssinanteId = str(formData, "responsavelAssinanteId");
  if (!numero) return { error: "Informe o número do laudo." };
  if (!produtorId) return { error: "Selecione o produtor." };
  if (!responsavelAssinanteId) return { error: "Selecione o responsável técnico assinante." };

  const ids = amostraIds(formData);

  let laudoId: string;
  try {
    const laudo = await prisma.$transaction(async (tx) => {
      const created = await tx.laudoTecnico.create({
        data: {
          organizationId,
          numero,
          produtorId,
          responsavelAssinanteId,
          interpretacaoAgronomica: str(formData, "interpretacaoAgronomica"),
          recomendacaoCalagemAdubacao: str(formData, "recomendacaoCalagemAdubacao"),
          templateUtilizado: str(formData, "templateUtilizado"),
          dataValidade: str(formData, "dataValidade") ? new Date(str(formData, "dataValidade")!) : null,
        },
      });
      if (ids.length > 0) {
        await tx.laudoAmostra.createMany({
          data: ids.map((amostraId) => ({ laudoId: created.id, amostraId })),
        });
      }
      return created;
    });
    laudoId = laudo.id;
  } catch {
    return { error: "Já existe um laudo com esse número." };
  }

  revalidatePath("/laboratorio/laudos");
  redirect(`/laboratorio/laudos/${laudoId}`);
}

export async function updateLaudoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const laudo = await prisma.laudoTecnico.findFirst({ where: { id, organizationId } });
  if (!laudo) return { error: "Laudo não encontrado." };

  const numero = str(formData, "numero");
  const produtorId = str(formData, "produtorId");
  const responsavelAssinanteId = str(formData, "responsavelAssinanteId");
  if (!numero) return { error: "Informe o número do laudo." };
  if (!produtorId) return { error: "Selecione o produtor." };
  if (!responsavelAssinanteId) return { error: "Selecione o responsável técnico assinante." };

  const ids = amostraIds(formData);

  try {
    await prisma.$transaction([
      prisma.laudoTecnico.update({
        where: { id },
        data: {
          numero,
          produtorId,
          responsavelAssinanteId,
          interpretacaoAgronomica: str(formData, "interpretacaoAgronomica"),
          recomendacaoCalagemAdubacao: str(formData, "recomendacaoCalagemAdubacao"),
          templateUtilizado: str(formData, "templateUtilizado"),
          dataValidade: str(formData, "dataValidade") ? new Date(str(formData, "dataValidade")!) : null,
        },
      }),
      prisma.laudoAmostra.deleteMany({ where: { laudoId: id } }),
      ...(ids.length > 0
        ? [prisma.laudoAmostra.createMany({ data: ids.map((amostraId) => ({ laudoId: id, amostraId })) })]
        : []),
    ]);
  } catch {
    return { error: "Já existe um laudo com esse número." };
  }

  revalidatePath(`/laboratorio/laudos/${id}`);
  revalidatePath("/laboratorio/laudos");
  redirect(`/laboratorio/laudos/${id}`);
}

export async function deleteLaudoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.laudoTecnico.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/laudos");
}

export async function emitirLaudoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.laudoTecnico.updateMany({
    where: { id, organizationId },
    data: { status: "EMITIDO", dataEmissao: new Date() },
  });
  revalidatePath(`/laboratorio/laudos/${id}`);
  revalidatePath("/laboratorio/laudos");
}

export async function cancelarLaudoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.laudoTecnico.updateMany({ where: { id, organizationId }, data: { status: "CANCELADO" } });
  revalidatePath(`/laboratorio/laudos/${id}`);
  revalidatePath("/laboratorio/laudos");
}

export async function reemitirLaudoAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  const laudo = await prisma.laudoTecnico.findFirst({ where: { id, organizationId } });
  if (!laudo) return;

  await prisma.laudoTecnico.update({
    where: { id },
    data: { status: "REEMITIDO", versao: laudo.versao + 1, dataEmissao: new Date() },
  });
  revalidatePath(`/laboratorio/laudos/${id}`);
  revalidatePath("/laboratorio/laudos");
}
