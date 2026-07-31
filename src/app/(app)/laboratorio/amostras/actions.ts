"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { amostraFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createAmostraAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(amostraFields, formData);
  if (!data.code) return { error: "Informe o código da amostra." };
  if (!data.propriedadeProdutorId) return { error: "Selecione a propriedade." };
  if (!data.dataColeta) return { error: "Informe a data da coleta." };

  let amostraId: string;
  try {
    const amostra = await prisma.$transaction(async (tx) => {
      const created = await tx.amostra.create({
        data: { ...data, organizationId } as Prisma.AmostraUncheckedCreateInput,
      });
      await tx.cadeiaCustodiaEvento.create({
        data: {
          amostraId: created.id,
          dataHora: (data.dataRecebimento as Date | undefined) ?? new Date(),
          local: "RECEPCAO",
          notes: "Amostra registrada no sistema.",
        },
      });
      return created;
    });
    amostraId = amostra.id;
  } catch {
    return { error: "Já existe uma amostra com esse código." };
  }

  revalidatePath("/laboratorio/amostras");
  redirect(`/laboratorio/amostras/${amostraId}`);
}

export async function updateAmostraAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("laboratorio");
  const data = buildRecordData(amostraFields, formData);
  if (!data.code) return { error: "Informe o código da amostra." };
  if (!data.propriedadeProdutorId) return { error: "Selecione a propriedade." };
  if (!data.dataColeta) return { error: "Informe a data da coleta." };

  try {
    await prisma.amostra.updateMany({
      where: { id, organizationId },
      data: data as Prisma.AmostraUncheckedUpdateInput,
    });
  } catch {
    return { error: "Já existe uma amostra com esse código." };
  }

  revalidatePath(`/laboratorio/amostras/${id}`);
  revalidatePath("/laboratorio/amostras");
  redirect(`/laboratorio/amostras/${id}`);
}

export async function deleteAmostraAction(id: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.amostra.deleteMany({ where: { id, organizationId } });
  revalidatePath("/laboratorio/amostras");
}

export async function updateAmostraStatusAction(
  amostraId: string,
  status: "RECEBIDA" | "EM_ANALISE" | "CONCLUIDA" | "CANCELADA"
) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.amostra.updateMany({ where: { id: amostraId, organizationId }, data: { status } });
  revalidatePath(`/laboratorio/amostras/${amostraId}`);
  revalidatePath("/laboratorio/amostras");
}

export async function addCustodiaEventoAction(amostraId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const amostra = await prisma.amostra.findFirst({ where: { id: amostraId, organizationId } });
  if (!amostra) return;

  const responsavelMovimentacao = (formData.get("responsavelMovimentacao") as string | null)?.trim() || null;
  const local = (formData.get("local") as string | null) || "RECEPCAO";
  const temperaturaRaw = formData.get("temperaturaArmazenamento");
  const temperaturaArmazenamento =
    temperaturaRaw && String(temperaturaRaw).trim() !== "" ? Number(temperaturaRaw) : null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  await prisma.cadeiaCustodiaEvento.create({
    data: {
      amostraId,
      local: local as Prisma.CadeiaCustodiaEventoUncheckedCreateInput["local"],
      responsavelMovimentacao,
      temperaturaArmazenamento,
      notes,
    },
  });

  revalidatePath(`/laboratorio/amostras/${amostraId}`);
}
