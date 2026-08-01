"use server";

import { prisma } from "@/lib/prisma";
import { criarTokenSenha } from "@/lib/password-reset";
import { enviarRedefinicaoSenhaEmail } from "@/lib/email";

type FormState = { success?: true; error?: string } | undefined;

export async function esqueciSenhaAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get("email") as string | null)?.trim();
  if (!email) return { error: "Informe o e-mail." };

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const { link } = await criarTokenSenha(user.id, "RESET");
    const resultado = user.organizationId
      ? await enviarRedefinicaoSenhaEmail({
          organizationId: user.organizationId,
          email: user.email,
          nomeUsuario: user.name,
          link,
        })
      : { skipped: true as const };

    if (!("success" in resultado)) {
      // TODO(Fernanda): diferente do convite (que o admin envia manualmente se quiser),
      // aqui é o próprio usuário pedindo — sem Resend configurado na organização (ou pra
      // super-admins, que não têm organização) não existe hoje um canal alternativo pra
      // mandar o link automaticamente. Por ora só logamos no servidor pra alguém da JHV
      // conseguir repassar manualmente em caso de suporte. Definir uma solução melhor
      // (ex.: WhatsApp) depois.
      console.log(`[esqueci-senha] link de redefinição para ${user.email}: ${link}`);
    }
  }

  // Mesma mensagem de sucesso independente de o e-mail existir ou não, pra não dar
  // pra descobrir quais e-mails têm conta no sistema.
  return { success: true };
}
