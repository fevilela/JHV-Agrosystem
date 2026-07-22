"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireOrg } from "@/lib/tenant";
import { getCompanyProfileFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function saveCompanyProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("configuracoes.empresa");

  const data = buildRecordData(getCompanyProfileFields(t), formData);
  if (!data.name) return { error: t("errorRequiredName") };

  await prisma.organization.update({
    where: { id: organizationId },
    data: data as Prisma.OrganizationUncheckedUpdateInput,
  });

  revalidatePath("/configuracoes/empresa");
  redirect("/configuracoes/empresa");
}
