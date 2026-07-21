"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const GRAPH_API_VERSION = "v21.0";

type SalvarState = { error?: string; success?: boolean } | undefined;

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function salvarWhatsappTokenAction(
  organizationId: string,
  _prevState: SalvarState,
  formData: FormData
): Promise<SalvarState> {
  const phoneNumberId = str(formData, "phoneNumberId");
  const accessToken = str(formData, "accessToken");
  const wabaId = str(formData, "wabaId") || undefined;

  if (!phoneNumberId || !accessToken) {
    return { error: "Informe o Phone Number ID e o Token de Acesso." };
  }

  let businessName: string | undefined;
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}?fields=verified_name,display_phone_number`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    if (!res.ok) {
      return {
        error: `A Meta não aceitou esses dados: ${data?.error?.message || JSON.stringify(data)}`,
      };
    }
    businessName = data?.verified_name || data?.display_phone_number;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao validar com a Meta." };
  }

  await prisma.whatsappConnection.upsert({
    where: { organizationId },
    create: { organizationId, phoneNumberId, wabaId, accessToken, businessName },
    update: { phoneNumberId, wabaId, accessToken, businessName },
  });

  revalidatePath("/configuracoes/whatsapp");
  return { success: true };
}

export async function desconectarWhatsappAction(organizationId: string) {
  await prisma.whatsappConnection.deleteMany({ where: { organizationId } });
  revalidatePath("/configuracoes/whatsapp");
}
