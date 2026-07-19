"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEntityConfig } from "@/lib/entities";
import {
  createEntityRecord,
  updateEntityRecord,
  deleteEntityRecord,
} from "@/lib/crud";
import { requireOrg } from "@/lib/tenant";

export async function createEntityAction(
  entitySlug: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const config = getEntityConfig(entitySlug);
  if (!config) return { error: "Cadastro inválido." };

  const { organizationId } = await requireOrg();

  try {
    await createEntityRecord(config, formData, organizationId);
  } catch {
    return { error: "Não foi possível salvar. Verifique os dados informados." };
  }

  revalidatePath(`/cadastro/${entitySlug}`);
  redirect(`/cadastro/${entitySlug}`);
}

export async function updateEntityAction(
  entitySlug: string,
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const config = getEntityConfig(entitySlug);
  if (!config) return { error: "Cadastro inválido." };

  const { organizationId } = await requireOrg();

  try {
    await updateEntityRecord(config, id, formData, organizationId);
  } catch {
    return { error: "Não foi possível salvar. Verifique os dados informados." };
  }

  revalidatePath(`/cadastro/${entitySlug}`);
  redirect(`/cadastro/${entitySlug}`);
}

export async function deleteEntityAction(entitySlug: string, id: string) {
  const config = getEntityConfig(entitySlug);
  if (!config) return;

  const { organizationId } = await requireOrg();

  await deleteEntityRecord(config, id, organizationId);
  revalidatePath(`/cadastro/${entitySlug}`);
}
