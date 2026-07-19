import { NextRequest, NextResponse } from "next/server";
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

/**
 * Rota legada (sem organização na URL), mantida só para boletos gerados
 * antes da separação por cliente — usa o token global de ambiente.
 * Boletos novos usam /api/webhooks/mercadopago/[organizationId].
 */
export async function POST(req: NextRequest) {
  const paymentId = await extractPaymentId(req);
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!paymentId || !accessToken) return NextResponse.json({ received: true }, { status: 200 });

  try {
    await processarWebhookPagamento(paymentId, accessToken);
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
