import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiOrgContext } from "@/lib/tenant";
import { renderMudaLoteRastreabilidadePdf } from "@/lib/muda-lote-rastreabilidade-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getApiOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const lote = await prisma.mudaLote.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: {
      especie: true,
      viveiro: true,
      faseEventos: { orderBy: { dataEntrada: "asc" } },
      insumos: { include: { stockItem: true }, orderBy: { data: "asc" } },
      irrigacoes: { include: { responsavel: true }, orderBy: { data: "asc" } },
      fitossanidades: { include: { responsavel: true }, orderBy: { data: "asc" } },
      maoDeObra: { include: { employee: true }, orderBy: { data: "asc" } },
      pedidoItens: { include: { pedido: { include: { cliente: true } } } },
    },
  });

  if (!lote) {
    return NextResponse.json({ error: "Lote não encontrado." }, { status: 404 });
  }

  const buffer = await renderMudaLoteRastreabilidadePdf(lote);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="rastreabilidade-${lote.code}.pdf"`,
    },
  });
}
