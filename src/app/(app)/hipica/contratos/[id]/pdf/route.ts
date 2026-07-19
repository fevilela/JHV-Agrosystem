import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderContractPdf } from "@/lib/contract-pdf";

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

  const company = await prisma.companyProfile.findUnique({ where: { id: "singleton" } });

  const buffer = await renderContractPdf(contract, company);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrato-${contract.client.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
