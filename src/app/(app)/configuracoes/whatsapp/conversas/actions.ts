"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/tenant";
import { enviarMensagemLivreWhatsapp } from "@/lib/whatsapp";

type EnviarState = { error?: string } | undefined;

export async function enviarMensagemAction(
  phone: string,
  _prevState: EnviarState,
  formData: FormData
): Promise<EnviarState> {
  const { organizationId } = await requireOrg();

  const texto = formData.get("texto");
  if (typeof texto !== "string" || !texto.trim()) {
    return { error: "Escreva uma mensagem." };
  }

  const resultado = await enviarMensagemLivreWhatsapp({
    organizationId,
    telefone: phone,
    texto: texto.trim(),
  });

  if (resultado.error) return { error: resultado.error };

  revalidatePath(`/configuracoes/whatsapp/conversas/${phone}`);
  revalidatePath("/configuracoes/whatsapp/conversas");
  return undefined;
}
