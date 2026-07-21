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

async function registrarMensagemEnviada(params: {
  organizationId: string;
  phone: string;
  content: string;
  templateName?: string;
  waMessageId?: string;
}) {
  // busca o cliente cujo telefone normalizado bate com o destinatário
  const clientes = await prisma.client.findMany({
    where: { organizationId: params.organizationId, phone: { not: null } },
    select: { id: true, phone: true },
  });
  const clienteEncontrado = clientes.find(
    (c) => c.phone && normalizarTelefoneWhatsapp(c.phone) === params.phone
  );

  await prisma.whatsappMessage.create({
    data: {
      organizationId: params.organizationId,
      clientId: clienteEncontrado?.id,
      phone: params.phone,
      direction: "SAIDA",
      content: params.content,
      templateName: params.templateName,
      waMessageId: params.waMessageId,
      status: "ENVIADO",
    },
  });
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

  const data = await res.json();
  const waMessageId = data?.messages?.[0]?.id as string | undefined;

  try {
    await registrarMensagemEnviada({
      organizationId: params.organizationId,
      phone: to,
      content: `Boleto: ${params.descricao} — ${params.valorFormatado}, vencimento ${params.vencimentoFormatado}`,
      templateName,
      waMessageId,
    });
  } catch (err) {
    console.error("Erro ao registrar mensagem de WhatsApp enviada:", err);
  }

  return { success: true };
}

export async function enviarContratoWhatsapp(params: {
  organizationId: string;
  telefone: string;
  nomeCliente: string;
  descricaoContrato: string;
  contratoUrl: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { accessToken, phoneNumberId } = await getWhatsappCredentials(params.organizationId);
  const templateName = "notificacao_contrato";

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
                { type: "text", parameter_name: "descricao", text: params.descricaoContrato },
                { type: "text", parameter_name: "link_contrato", text: params.contratoUrl },
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

  const data = await res.json();
  const waMessageId = data?.messages?.[0]?.id as string | undefined;

  try {
    await registrarMensagemEnviada({
      organizationId: params.organizationId,
      phone: to,
      content: `Contrato: ${params.descricaoContrato}`,
      templateName,
      waMessageId,
    });
  } catch (err) {
    console.error("Erro ao registrar mensagem de WhatsApp enviada:", err);
  }

  return { success: true };
}

export async function enviarMensagemLivreWhatsapp(params: {
  organizationId: string;
  telefone: string;
  texto: string;
}): Promise<{ success?: true; error?: string }> {
  const { accessToken, phoneNumberId } = await getWhatsappCredentials(params.organizationId);
  if (!accessToken || !phoneNumberId) {
    return { error: "Nenhum WhatsApp conectado pra essa organização." };
  }

  const to = normalizarTelefoneWhatsapp(params.telefone);
  if (!to) return { error: "Telefone inválido." };

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
        type: "text",
        text: { body: params.texto },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    // Fora da janela de 24h após a última mensagem do cliente, a Meta rejeita texto livre
    // e exige um modelo aprovado — a mensagem de erro dela já explica isso claramente.
    return { error: `WhatsApp API respondeu ${res.status}: ${body}` };
  }

  const data = await res.json();
  const waMessageId = data?.messages?.[0]?.id as string | undefined;

  await registrarMensagemEnviada({
    organizationId: params.organizationId,
    phone: to,
    content: params.texto,
    waMessageId,
  });

  return { success: true };
}
