"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { requireOrg } from "@/lib/tenant";
import { companyProfileFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function saveCompanyProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireOrg();

  const data = buildRecordData(companyProfileFields, formData);
  if (!data.name) return { error: "Informe a razão social/nome da empresa." };

  await prisma.organization.update({
    where: { id: organizationId },
    data: data as Prisma.OrganizationUncheckedUpdateInput,
  });

  revalidatePath("/configuracoes/empresa");
  redirect("/configuracoes/empresa");
}
