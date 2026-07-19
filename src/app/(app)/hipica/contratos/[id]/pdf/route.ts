import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderContractPdf } from "@/lib/contract-pdf";
import { requireModule } from "@/lib/tenant";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId },
    include: { client: true, animal: true, stall: true, piquete: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  const buffer = await renderContractPdf(contract, organization);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrato-${contract.client.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
