import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processarWebhookPagamento } from "@/lib/boleto-service";

async function extractPaymentId(req: NextRequest): Promise<string | null> {
  const url = new URL(req.url);
  const queryId = url.searchParams.get("data.id") || url.searchParams.get("id");
  if (queryId) return queryId;

  try {
    const body = await req.json();
    return body?.data?.id ? String(body.data.id) : null;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const paymentId = await extractPaymentId(req);
  if (!paymentId) return NextResponse.json({ received: true }, { status: 200 });

  try {
    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!organization?.mpAccessToken) {
      console.error(`Webhook Mercado Pago: organização ${organizationId} sem token configurado.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await processarWebhookPagamento(paymentId, organization.mpAccessToken);
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ organizationId: string }> }
) {
  return POST(req, ctx);
}
