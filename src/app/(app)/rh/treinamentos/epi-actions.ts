"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getEpiFields } from "./epi-fields";

type FormState = { error?: string } | undefined;

export async function createEpiAction(
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("rh.epis.errors");
  const tf = await getTranslations("rh.epis.fields");
  const data = buildRecordData(getEpiFields(tf), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.itemName) return { error: t("itemRequired") };
  if (!data.issueDate) return { error: t("issueDateRequired") };

  await prisma.epiIssuance.create({
    data: data as Prisma.EpiIssuanceUncheckedCreateInput,
  });

  revalidatePath("/rh/treinamentos/epis");
  redirect("/rh/treinamentos/epis");
}

export async function updateEpiAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const t = await getTranslations("rh.epis.errors");
  const tf = await getTranslations("rh.epis.fields");
  const data = buildRecordData(getEpiFields(tf), formData);
  if (!data.employeeId) return { error: t("employeeRequired") };
  if (!data.itemName) return { error: t("itemRequired") };
  if (!data.issueDate) return { error: t("issueDateRequired") };

  await prisma.epiIssuance.update({
    where: { id },
    data: data as Prisma.EpiIssuanceUncheckedUpdateInput,
  });

  revalidatePath("/rh/treinamentos/epis");
  redirect("/rh/treinamentos/epis");
}

export async function deleteEpiAction(id: string) {
  await prisma.epiIssuance.delete({ where: { id } });
  revalidatePath("/rh/treinamentos/epis");
}
