"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEntityConfig } from "@/lib/entities";
import {
  createEntityRecord,
  updateEntityRecord,
  deleteEntityRecord,
} from "@/lib/crud";

export async function createEntityAction(
  entitySlug: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const config = getEntityConfig(entitySlug);
  if (!config) return { error: "Cadastro inválido." };

  try {
    await createEntityRecord(config, formData);
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

  try {
    await updateEntityRecord(config, id, formData);
  } catch {
    return { error: "Não foi possível salvar. Verifique os dados informados." };
  }

  revalidatePath(`/cadastro/${entitySlug}`);
  redirect(`/cadastro/${entitySlug}`);
}

export async function deleteEntityAction(entitySlug: string, id: string) {
  const config = getEntityConfig(entitySlug);
  if (!config) return;

  await deleteEntityRecord(config, id);
  revalidatePath(`/cadastro/${entitySlug}`);
}
