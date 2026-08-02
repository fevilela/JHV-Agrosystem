"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireModule } from "@/lib/tenant";
import { buildAdvancePhasePayload, hasSufficientStock } from "@/lib/muda-lote";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import { mudaLoteCreateFields, mudaLoteEditFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createMudaLoteAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaLoteCreateFields, formData);
  if (!data.code) return { error: "Informe o código do lote." };
  if (!data.especieId) return { error: "Selecione a espécie." };
  if (!data.viveiroId) return { error: "Selecione o viveiro." };
  if (!data.dataSemeaduraEstaqueamento) return { error: "Informe a data de semeadura/estaqueamento." };
  const quantidadeInicial = Number(data.quantidadeInicial);
  if (!quantidadeInicial || quantidadeInicial <= 0) {
    return { error: "Informe uma quantidade inicial válida." };
  }

  let loteId: string;
  try {
    const lote = await prisma.$transaction(async (tx) => {
      const created = await tx.mudaLote.create({
        data: {
          ...data,
          quantidadeInicial,
          quantidadeAtual: quantidadeInicial,
          organizationId,
        } as Prisma.MudaLoteUncheckedCreateInput,
      });
      await tx.mudaFaseEvento.create({
        data: {
          loteId: created.id,
          fase: "SEMEADURA_ESTAQUEAMENTO",
          dataEntrada: data.dataSemeaduraEstaqueamento as Date,
        },
      });
      return created;
    });
    loteId = lote.id;
  } catch {
    return { error: "Já existe um lote com esse código." };
  }

  revalidatePath("/viveiro/lotes");
  redirect(`/viveiro/lotes/${loteId}`);
}

export async function updateMudaLoteAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireModule("viveiro");
  const data = buildRecordData(mudaLoteEditFields, formData);
  if (!data.viveiroId) return { error: "Selecione o viveiro." };

  await prisma.mudaLote.updateMany({
    where: { id, organizationId },
    data: data as Prisma.MudaLoteUncheckedUpdateInput,
  });

  revalidatePath(`/viveiro/lotes/${id}`);
  revalidatePath("/viveiro/lotes");
  redirect(`/viveiro/lotes/${id}`);
}

export async function deleteMudaLoteAction(id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaLote.deleteMany({ where: { id, organizationId } });
  revalidatePath("/viveiro/lotes");
}

export async function advanceFaseAction(loteId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");

  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote) return;

  const currentEvent = await prisma.mudaFaseEvento.findFirst({
    where: { loteId, fase: lote.faseAtual, dataSaida: null },
    orderBy: { dataEntrada: "desc" },
  });
  if (!currentEvent) return;

  const raw = formData.get("quantidadePerdida");
  const quantidadePerdida = raw && String(raw).trim() !== "" ? Number(raw) : 0;

  const payload = buildAdvancePhasePayload(currentEvent, quantidadePerdida, new Date());
  if (!payload) return;

  await prisma.$transaction([
    prisma.mudaFaseEvento.update({
      where: { id: payload.closePrevious.id },
      data: {
        dataSaida: payload.closePrevious.dataSaida,
        quantidadePerdida: payload.closePrevious.quantidadePerdida,
      },
    }),
    prisma.mudaFaseEvento.create({
      data: {
        loteId,
        fase: payload.newEvent.fase,
        dataEntrada: payload.newEvent.dataEntrada,
      },
    }),
    prisma.mudaLote.update({
      where: { id: loteId },
      data: {
        faseAtual: payload.newEvent.fase,
        quantidadeAtual: Math.max(0, lote.quantidadeAtual - quantidadePerdida),
      },
    }),
  ]);

  revalidatePath(`/viveiro/lotes/${loteId}`);
  revalidatePath("/viveiro/lotes");
}

// ---------- Insumos (consome StockItem, mesmo padrão de ServiceOrderPart/Oficina) ----------

export async function addMudaLoteInsumoAction(
  loteId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireModule("viveiro");
  const stockItemId = formData.get("stockItemId") as string | null;
  const quantidadeRaw = formData.get("quantidade") as string | null;
  const unitCostRaw = formData.get("unitCost") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;
  if (!stockItemId) return { error: "Selecione o insumo." };
  if (!quantidadeRaw) return { error: "Informe a quantidade." };

  const [lote, stockItem] = await Promise.all([
    prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } }),
    prisma.stockItem.findFirst({ where: { id: stockItemId, organizationId } }),
  ]);
  if (!lote) return { error: "Lote não encontrado." };
  if (!stockItem) return { error: "Insumo não encontrado." };

  const quantidade = Number(quantidadeRaw);
  const unitCost = unitCostRaw ? Number(unitCostRaw) : null;

  if (!hasSufficientStock(Number(stockItem.currentQuantity), quantidade)) {
    return {
      error: `Quantidade solicitada (${quantidade}) maior que o estoque disponível (${String(stockItem.currentQuantity)}).`,
    };
  }

  await prisma.$transaction([
    prisma.mudaLoteInsumo.create({
      data: { loteId, stockItemId, quantidade, unitCost, notes, organizationId },
    }),
    prisma.stockItem.update({
      where: { id: stockItemId },
      data: { currentQuantity: { decrement: quantidade } },
    }),
  ]);

  revalidatePath(`/viveiro/lotes/${loteId}`);
  revalidatePath("/estoque/materiais");
}

export async function deleteMudaLoteInsumoAction(loteId: string, id: string) {
  const { organizationId } = await requireModule("viveiro");
  const insumo = await prisma.mudaLoteInsumo.findFirst({
    where: { id, loteId, organizationId },
  });
  if (!insumo) return;

  await prisma.$transaction([
    prisma.mudaLoteInsumo.delete({ where: { id } }),
    prisma.stockItem.update({
      where: { id: insumo.stockItemId },
      data: { currentQuantity: { increment: insumo.quantidade } },
    }),
  ]);

  revalidatePath(`/viveiro/lotes/${loteId}`);
  revalidatePath("/estoque/materiais");
}

// ---------- Irrigação ----------

export async function addMudaLoteIrrigacaoAction(loteId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");
  const data = formData.get("data") as string | null;
  if (!data) return;

  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote) return;

  const metodo = (formData.get("metodo") as string | null)?.trim() || null;
  const duracaoRaw = formData.get("duracaoMinutos") as string | null;
  const responsavelId = (formData.get("responsavelId") as string | null) || null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  await prisma.mudaLoteIrrigacao.create({
    data: {
      loteId,
      data: new Date(data),
      metodo,
      duracaoMinutos: duracaoRaw ? Number(duracaoRaw) : null,
      responsavelId,
      notes,
      organizationId,
    },
  });

  revalidatePath(`/viveiro/lotes/${loteId}`);
}

export async function deleteMudaLoteIrrigacaoAction(loteId: string, id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaLoteIrrigacao.deleteMany({ where: { id, loteId, organizationId } });
  revalidatePath(`/viveiro/lotes/${loteId}`);
}

// ---------- Fitossanidade ----------

export async function addMudaLoteFitossanidadeAction(loteId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");
  const data = formData.get("data") as string | null;
  const tipo = formData.get("tipo") as string | null;
  if (!data || !tipo) return;

  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote) return;

  const produtoAplicado = (formData.get("produtoAplicado") as string | null)?.trim() || null;
  const dosagem = (formData.get("dosagem") as string | null)?.trim() || null;
  const responsavelId = (formData.get("responsavelId") as string | null) || null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  await prisma.mudaLoteFitossanidade.create({
    data: {
      loteId,
      data: new Date(data),
      tipo: tipo as Prisma.MudaLoteFitossanidadeUncheckedCreateInput["tipo"],
      produtoAplicado,
      dosagem,
      responsavelId,
      notes,
      organizationId,
    },
  });

  revalidatePath(`/viveiro/lotes/${loteId}`);
}

export async function deleteMudaLoteFitossanidadeAction(loteId: string, id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaLoteFitossanidade.deleteMany({ where: { id, loteId, organizationId } });
  revalidatePath(`/viveiro/lotes/${loteId}`);
}

// ---------- Mão de obra ----------

export async function addMudaLoteMaoDeObraAction(loteId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");
  const data = formData.get("data") as string | null;
  const employeeId = formData.get("employeeId") as string | null;
  const atividade = (formData.get("atividade") as string | null)?.trim();
  const horasRaw = formData.get("horasTrabalhadas") as string | null;
  if (!data || !employeeId || !atividade || !horasRaw) return;

  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote) return;

  const custoHoraRaw = formData.get("custoHora") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  await prisma.mudaLoteMaoDeObra.create({
    data: {
      loteId,
      employeeId,
      data: new Date(data),
      atividade,
      horasTrabalhadas: Number(horasRaw),
      custoHora: custoHoraRaw ? Number(custoHoraRaw) : null,
      notes,
      organizationId,
    },
  });

  revalidatePath(`/viveiro/lotes/${loteId}`);
}

export async function deleteMudaLoteMaoDeObraAction(loteId: string, id: string) {
  const { organizationId } = await requireModule("viveiro");
  await prisma.mudaLoteMaoDeObra.deleteMany({ where: { id, loteId, organizationId } });
  revalidatePath(`/viveiro/lotes/${loteId}`);
}

// ---------- Certificados (rastreabilidade) ----------

export async function addMudaLoteCertificadoAction(loteId: string, formData: FormData) {
  const { organizationId } = await requireModule("viveiro");
  const lote = await prisma.mudaLote.findFirst({ where: { id: loteId, organizationId } });
  if (!lote) return;

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const emitidoEmRaw = formData.get("emitidoEm") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  const { url, name } = await saveUploadedFile(file, `viveiro/lotes/${loteId}/certificados`);

  await prisma.mudaLoteCertificado.create({
    data: {
      loteId,
      url,
      nome: name,
      emitidoEm: emitidoEmRaw ? new Date(emitidoEmRaw) : null,
      notes,
    },
  });

  revalidatePath(`/viveiro/lotes/${loteId}`);
}

export async function deleteMudaLoteCertificadoAction(loteId: string, id: string) {
  const { organizationId } = await requireModule("viveiro");
  const certificado = await prisma.mudaLoteCertificado.findFirst({
    where: { id, loteId, lote: { organizationId } },
  });
  if (!certificado) return;

  await prisma.mudaLoteCertificado.delete({ where: { id } });
  await deleteUploadedFile(certificado.url);

  revalidatePath(`/viveiro/lotes/${loteId}`);
}
