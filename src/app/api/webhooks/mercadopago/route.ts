import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentClient } from "@/lib/mercadopago";

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

export async function POST(req: NextRequest) {
  const paymentId = await extractPaymentId(req);
  if (!paymentId) return NextResponse.json({ received: true }, { status: 200 });

  try {
    const payment = await getPaymentClient().get({ id: paymentId });
    const entryId = payment.external_reference;

    const entry = entryId
      ? await prisma.financeEntry.findUnique({ where: { id: entryId } })
      : await prisma.financeEntry.findUnique({
          where: { mpPaymentId: String(payment.id) },
        });

    if (entry && payment.status === "approved" && entry.status !== "PAGO") {
      await prisma.financeEntry.update({
        where: { id: entry.id },
        data: {
          status: "PAGO",
          paymentDate: payment.date_approved ? new Date(payment.date_approved) : new Date(),
        },
      });
    }
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
