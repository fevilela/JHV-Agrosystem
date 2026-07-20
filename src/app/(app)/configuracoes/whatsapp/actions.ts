"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const GRAPH_API_VERSION = "v21.0";

type ConectarState = { error?: string; success?: boolean } | undefined;

export async function conectarWhatsappAction(
  organizationId: string,
  params: {
    code: string;
    phoneNumberId: string;
    wabaId?: string;
  }
): Promise<ConectarState> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return { error: "NEXT_PUBLIC_META_APP_ID / META_APP_SECRET não configurados no servidor." };
  }
  if (!params.code || !params.phoneNumberId) {
    return { error: "Conexão incompleta: faltou o código de autorização ou o Phone Number ID." };
  }

  try {
    const shortLivedRes = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${params.code}`
    );
    const shortLivedData = await shortLivedRes.json();
    if (!shortLivedRes.ok || !shortLivedData.access_token) {
      return { error: `Falha ao trocar o código por token: ${JSON.stringify(shortLivedData)}` };
    }

    const longLivedRes = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedData.access_token}`
    );
    const longLivedData = await longLivedRes.json();
    if (!longLivedRes.ok || !longLivedData.access_token) {
      return { error: `Falha ao gerar token de longa duração: ${JSON.stringify(longLivedData)}` };
    }

    const accessToken = longLivedData.access_token as string;
    let businessName: string | undefined;

    if (params.wabaId) {
      try {
        await fetch(
          `https://graph.facebook.com/${GRAPH_API_VERSION}/${params.wabaId}/subscribed_apps`,
          { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const infoRes = await fetch(
          `https://graph.facebook.com/${GRAPH_API_VERSION}/${params.wabaId}?fields=name`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const infoData = await infoRes.json();
        businessName = infoData?.name;
      } catch {
        // não bloqueia a conexão se esses passos auxiliares falharem
      }
    }

    await prisma.whatsappConnection.upsert({
      where: { organizationId },
      create: {
        organizationId,
        phoneNumberId: params.phoneNumberId,
        wabaId: params.wabaId,
        accessToken,
        businessName,
      },
      update: {
        phoneNumberId: params.phoneNumberId,
        wabaId: params.wabaId,
        accessToken,
        businessName,
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao conectar com o WhatsApp." };
  }

  revalidatePath("/configuracoes/whatsapp");
  return { success: true };
}

export async function desconectarWhatsappAction(organizationId: string) {
  await prisma.whatsappConnection.deleteMany({ where: { organizationId } });
  revalidatePath("/configuracoes/whatsapp");
}
