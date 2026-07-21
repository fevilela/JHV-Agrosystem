import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderContractPdf } from "@/lib/contract-pdf";

// Rota pública (sem login) pra permitir que o cliente abra o PDF do contrato pelo link
// enviado por WhatsApp/e-mail — protegida só pelo id do contrato ser um cuid não
// adivinhável, mesmo padrão de segurança que o link do boleto do Mercado Pago já usa.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { client: true, animal: true, stall: true, piquete: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: contract.organizationId },
  });

  const buffer = await renderContractPdf(contract, organization);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${contract.client.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
