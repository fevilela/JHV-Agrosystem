import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

async function getEmailCredentials(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { resendApiKey: true, resendFromEmail: true },
  });
  return {
    apiKey: organization?.resendApiKey ?? undefined,
    fromEmail: organization?.resendFromEmail ?? undefined,
  };
}

export async function enviarBoletoEmail(params: {
  organizationId: string;
  email: string;
  nomeCliente: string;
  descricao: string;
  valorFormatado: string;
  vencimentoFormatado: string;
  boletoUrl: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { apiKey, fromEmail } = await getEmailCredentials(params.organizationId);
  if (!apiKey || !fromEmail) return { skipped: true };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: `Boleto: ${params.descricao}`,
      html: `
        <p>Olá, ${params.nomeCliente}!</p>
        <p>Segue o boleto referente a <strong>${params.descricao}</strong>:</p>
        <ul>
          <li>Valor: <strong>${params.valorFormatado}</strong></li>
          <li>Vencimento: <strong>${params.vencimentoFormatado}</strong></li>
        </ul>
        <p><a href="${params.boletoUrl}">Clique aqui para acessar o boleto</a></p>
      `,
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar e-mail." };
  }
}
