"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { amostraFields } from "./fields";
import { checkFaixaAceitavel } from "@/lib/controle-qualidade";

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

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(formData: FormData, name: string) {
  const value = str(formData, name);
  return value === null ? null : Number(value);
}

export async function createResultadoAction(amostraId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const amostra = await prisma.amostra.findFirst({ where: { id: amostraId, organizationId } });
  if (!amostra) return;

  const metodoAnaliticoId = str(formData, "metodoAnaliticoId");
  const valor = num(formData, "valor");
  const dataAnalise = str(formData, "dataAnalise");
  if (!metodoAnaliticoId || valor === null || !dataAnalise) return;

  await prisma.resultado.create({
    data: {
      organizationId,
      amostraId,
      metodoAnaliticoId,
      valor,
      dataAnalise: new Date(dataAnalise),
      analistaId: str(formData, "analistaId"),
      equipamentoId: str(formData, "equipamentoId"),
      loteReagenteId: str(formData, "loteReagenteId"),
      repeticoes: num(formData, "repeticoes"),
      observacoes: str(formData, "observacoes"),
    },
  });

  revalidatePath(`/laboratorio/amostras/${amostraId}`);
}

export async function updateResultadoStatusAction(
  amostraId: string,
  resultadoId: string,
  status: "PENDENTE" | "VALIDADO" | "REPROVADO"
) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.resultado.updateMany({ where: { id: resultadoId, organizationId }, data: { status } });
  revalidatePath(`/laboratorio/amostras/${amostraId}`);
}

export async function deleteResultadoAction(amostraId: string, resultadoId: string) {
  const { organizationId } = await requireModule("laboratorio");
  await prisma.resultado.deleteMany({ where: { id: resultadoId, organizationId } });
  revalidatePath(`/laboratorio/amostras/${amostraId}`);
}

export async function addControleQualidadeAction(amostraId: string, formData: FormData) {
  const { organizationId } = await requireModule("laboratorio");
  const resultadoId = str(formData, "resultadoId");
  const tipo = str(formData, "tipo");
  const resultadoControleManual = str(formData, "resultadoControle");
  const valorObtido = num(formData, "valorObtido");
  const faixaAceitavelMin = num(formData, "faixaAceitavelMin");
  const faixaAceitavelMax = num(formData, "faixaAceitavelMax");

  // Quando valor + faixa estão todos preenchidos, o veredito é calculado
  // em vez de confiar na seleção manual (ver src/lib/controle-qualidade.ts).
  const resultadoControle =
    checkFaixaAceitavel(valorObtido, faixaAceitavelMin, faixaAceitavelMax) ?? resultadoControleManual;
  if (!resultadoId || !tipo || !resultadoControle) return;

  const resultado = await prisma.resultado.findFirst({ where: { id: resultadoId, organizationId } });
  if (!resultado) return;

  await prisma.controleQualidade.create({
    data: {
      organizationId,
      resultadoId,
      tipo: tipo as Prisma.ControleQualidadeUncheckedCreateInput["tipo"],
      resultadoControle: resultadoControle as Prisma.ControleQualidadeUncheckedCreateInput["resultadoControle"],
      valorObtido,
      faixaAceitavelMin,
      faixaAceitavelMax,
      acaoCorretiva: str(formData, "acaoCorretiva"),
      notes: str(formData, "notes"),
    },
  });

  revalidatePath(`/laboratorio/amostras/${amostraId}`);
}
