"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { companyProfileFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function saveCompanyProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = buildRecordData(companyProfileFields, formData);
  if (!data.name) return { error: "Informe a razão social/nome da empresa." };

  await prisma.companyProfile.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data } as Prisma.CompanyProfileUncheckedCreateInput,
    update: data as Prisma.CompanyProfileUncheckedUpdateInput,
  });

  revalidatePath("/configuracoes/empresa");
  redirect("/configuracoes/empresa");
}
