import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { INVITE_TOKEN_EXPIRY_DAYS, RESET_TOKEN_EXPIRY_HOURS } from "@/lib/password-reset";

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

// E-mails de sistema (convite/redefinição de senha) usam a conta Resend da própria
// plataforma JHV, não a de cada organização — senão toda organização nova cairia
// sempre no fallback de "mostrar link na tela" no primeiro convite, já que ela ainda
// não teria configurado o Resend dela. O Resend por organização (getEmailCredentials
// acima) continua existindo só pros e-mails de negócio (boleto/contrato).
export function getPlatformEmailCredentials() {
  return {
    apiKey: process.env.RESEND_API_KEY || undefined,
    fromEmail: process.env.RESEND_FROM_EMAIL || undefined,
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

export async function enviarConviteSenhaEmail(params: {
  email: string;
  nomeUsuario: string;
  link: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { apiKey, fromEmail } = getPlatformEmailCredentials();
  if (!apiKey || !fromEmail) return { skipped: true };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: "Defina sua senha de acesso",
      html: `
        <p>Olá, ${params.nomeUsuario}!</p>
        <p>Sua conta no sistema foi criada. Clique no link abaixo para definir sua senha de acesso:</p>
        <p><a href="${params.link}">Definir minha senha</a></p>
        <p>Esse link expira em ${INVITE_TOKEN_EXPIRY_DAYS} dias.</p>
      `,
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar e-mail." };
  }
}

export async function enviarRedefinicaoSenhaEmail(params: {
  email: string;
  nomeUsuario: string;
  link: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { apiKey, fromEmail } = getPlatformEmailCredentials();
  if (!apiKey || !fromEmail) return { skipped: true };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: "Redefinição de senha",
      html: `
        <p>Olá, ${params.nomeUsuario}!</p>
        <p>Recebemos um pedido para redefinir sua senha de acesso. Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${params.link}">Redefinir minha senha</a></p>
        <p>Esse link expira em ${RESET_TOKEN_EXPIRY_HOURS} hora(s). Se você não pediu essa redefinição, ignore este e-mail.</p>
      `,
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar e-mail." };
  }
}

export async function enviarContratoEmail(params: {
  organizationId: string;
  email: string;
  nomeCliente: string;
  descricaoContrato: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<{ success?: true; skipped?: true; error?: string }> {
  const { apiKey, fromEmail } = await getEmailCredentials(params.organizationId);
  if (!apiKey || !fromEmail) return { skipped: true };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: `Contrato: ${params.descricaoContrato}`,
      html: `
        <p>Olá, ${params.nomeCliente}!</p>
        <p>Segue em anexo o contrato referente a <strong>${params.descricaoContrato}</strong>.</p>
      `,
      attachments: [
        {
          filename: params.pdfFilename,
          content: params.pdfBuffer,
        },
      ],
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar e-mail." };
  }
}
