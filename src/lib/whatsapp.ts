import { prisma } from "@/lib/prisma";

const GRAPH_API_VERSION = "v21.0";

export function normalizarTelefoneWhatsapp(telefone: string): string | null {
  const digits = telefone.replace(/\D/g, "");
  if (/^55\d{10,11}$/.test(digits)) return digits;
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`;
  return null;
}

async function getWhatsappCredentials() {
  const connection = await prisma.whatsappConnection.findUnique({
    where: { id: "singleton" },
  });
  if (connection) {
    return { accessToken: connection.accessToken, phoneNumberId: connection.phoneNumberId };
  }
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  };
}

export async function enviarBoletoWhatsapp(params: {
  telefone: string;
  nomeCliente: string;
  descricao: string;
  valorFormatado: string;
  vencimentoFormatado: string;
  boletoUrl: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { accessToken, phoneNumberId } = await getWhatsappCredentials();
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "notificacao_boleto";

  if (!accessToken || !phoneNumberId) return { skipped: true };

  const to = normalizarTelefoneWhatsapp(params.telefone);
  if (!to) return { skipped: true, error: "Telefone do cliente inválido para WhatsApp." };

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: params.nomeCliente },
                { type: "text", text: params.descricao },
                { type: "text", text: params.valorFormatado },
                { type: "text", text: params.vencimentoFormatado },
                { type: "text", text: params.boletoUrl },
              ],
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    return { error: `WhatsApp API respondeu ${res.status}: ${body}` };
  }

  return { success: true };
}
