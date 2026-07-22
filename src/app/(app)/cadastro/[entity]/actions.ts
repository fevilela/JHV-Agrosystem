"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("cadastro");
  const config = getEntityConfig(entitySlug, t);
  if (!config) return { error: t("errors.invalidEntity") };

  const { organizationId, userId, userName } = await requireOrg();

  try {
    await createEntityRecord(config, formData, organizationId, { userId, userName });
  } catch {
    return { error: t("errors.saveError") };
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
  const t = await getTranslations("cadastro");
  const config = getEntityConfig(entitySlug, t);
  if (!config) return { error: t("errors.invalidEntity") };

  const { organizationId, userId, userName } = await requireOrg();

  try {
    await updateEntityRecord(config, id, formData, organizationId, { userId, userName });
  } catch {
    return { error: t("errors.saveError") };
  }

  revalidatePath(`/cadastro/${entitySlug}`);
  redirect(`/cadastro/${entitySlug}`);
}

export async function deleteEntityAction(entitySlug: string, id: string) {
  const t = await getTranslations("cadastro");
  const config = getEntityConfig(entitySlug, t);
  if (!config) return;

  const { organizationId, userId, userName } = await requireOrg();

  await deleteEntityRecord(config, id, organizationId, { userId, userName });
  revalidatePath(`/cadastro/${entitySlug}`);
}
