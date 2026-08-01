"use server";

import { redirect } from "next/navigation";
import { consumirToken } from "@/lib/password-reset";

type FormState = { error?: string } | undefined;

const errorMessages: Record<string, string> = {
  nao_encontrado: "Esse link de redefinição de senha não é válido.",
  expirado: "Esse link de redefinição de senha expirou. Peça um novo.",
  ja_usado: "Esse link já foi usado. Peça um novo se ainda precisar redefinir a senha.",
};

export async function redefinirSenhaAction(
  token: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const senha = formData.get("senha") as string;
  const confirmacao = formData.get("confirmacao") as string;

  if (!senha || senha.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmacao) {
    return { error: "As senhas não coincidem." };
  }

  const resultado = await consumirToken(token, senha);
  if (!resultado.ok) return { error: errorMessages[resultado.error] };

  redirect("/login?senhaRedefinida=1");
}
