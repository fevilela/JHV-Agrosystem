import { prisma } from "@/lib/prisma";

const GRAPH_API_VERSION = "v21.0";

export function normalizarTelefoneWhatsapp(telefone: string): string | null {
  const digits = telefone.replace(/\D/g, "");
  if (/^55\d{10,11}$/.test(digits)) return digits;
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`;
  return null;
}

async function getWhatsappCredentials(organizationId: string) {
  const connection = await prisma.whatsappConnection.findUnique({
    where: { organizationId },
  });
  if (connection) {
    return { accessToken: connection.accessToken, phoneNumberId: connection.phoneNumberId };
  }
  return { accessToken: undefined, phoneNumberId: undefined };
}

export async function enviarBoletoWhatsapp(params: {
  organizationId: string;
  telefone: string;
  nomeCliente: string;
  descricao: string;
  valorFormatado: string;
  vencimentoFormatado: string;
  boletoUrl: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { accessToken, phoneNumberId } = await getWhatsappCredentials(params.organizationId);
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
                { type: "text", parameter_name: "nome_cliente", text: params.nomeCliente },
                { type: "text", parameter_name: "descricao", text: params.descricao },
                { type: "text", parameter_name: "valor", text: params.valorFormatado },
                { type: "text", parameter_name: "vencimento", text: params.vencimentoFormatado },
                { type: "text", parameter_name: "link_boleto", text: params.boletoUrl },
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
