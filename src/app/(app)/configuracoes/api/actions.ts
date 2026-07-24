"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { generateApiKey } from "@/lib/api-keys";

export async function createApiKeyAction(
  _prevState: { token: string } | { error: string } | undefined,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe um nome para identificar a chave." };

  const { token, keyPrefix, keyHash } = generateApiKey();
  await prisma.apiKey.create({
    data: { organizationId, name, keyPrefix, keyHash },
  });

  revalidatePath("/configuracoes/api");
  return { token };
}

export async function revokeApiKeyAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.apiKey.updateMany({
    where: { id, organizationId },
    data: { revoked: true },
  });
  revalidatePath("/configuracoes/api");
}
