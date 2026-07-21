import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizarTelefoneWhatsapp } from "@/lib/whatsapp";
import type { WhatsappMessageStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

const statusMap: Record<string, WhatsappMessageStatus> = {
  sent: "ENVIADO",
  delivered: "ENTREGUE",
  read: "LIDO",
  failed: "FALHOU",
};

type WhatsappWebhookMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
};

type WhatsappWebhookStatus = {
  id: string;
  status: string;
};

type WhatsappWebhookValue = {
  metadata?: { phone_number_id?: string };
  messages?: WhatsappWebhookMessage[];
  statuses?: WhatsappWebhookStatus[];
};

async function resolverCliente(organizationId: string, phone: string) {
  const clientes = await prisma.client.findMany({
    where: { organizationId, phone: { not: null } },
    select: { id: true, phone: true },
  });
  return clientes.find((c) => c.phone && normalizarTelefoneWhatsapp(c.phone) === phone)?.id;
}

function extrairConteudo(msg: WhatsappWebhookMessage) {
  if (msg.type === "text" && msg.text?.body) return msg.text.body;
  return `[mensagem do tipo ${msg.type}]`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entries: { changes?: { value?: WhatsappWebhookValue }[] }[] = body?.entry ?? [];

    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;
        if (!value || !phoneNumberId) continue;

        const connection = await prisma.whatsappConnection.findFirst({
          where: { phoneNumberId },
          select: { organizationId: true },
        });
        if (!connection) continue;

        for (const msg of value.messages ?? []) {
          const clientId = await resolverCliente(connection.organizationId, msg.from);
          await prisma.whatsappMessage.upsert({
            where: { waMessageId: msg.id },
            create: {
              organizationId: connection.organizationId,
              clientId,
              phone: msg.from,
              direction: "ENTRADA",
              content: extrairConteudo(msg),
              waMessageId: msg.id,
              status: "ENTREGUE",
            },
            update: {},
          });
        }

        for (const status of value.statuses ?? []) {
          const novoStatus = statusMap[status.status];
          if (!novoStatus) continue;
          await prisma.whatsappMessage.updateMany({
            where: { waMessageId: status.id },
            data: { status: novoStatus },
          });
        }
      }
    }
  } catch (err) {
    console.error("Erro ao processar webhook do WhatsApp:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
