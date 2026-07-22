"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getTratoFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("agricultura.tratosCulturais.fields");
  const tType = await getTranslations("labels.tratoCulturalType");
  return getTratoFields(tf, tType);
}

export async function createTratoAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.tratosCulturais.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const safra = await prisma.safra.findFirst({
    where: { id: data.safraId as string, talhao: { organizationId } },
  });
  if (!safra) return { error: t("safraRequired") };

  await prisma.tratoCultural.create({
    data: data as Prisma.TratoCulturalUncheckedCreateInput,
  });

  revalidatePath("/agricultura/tratos-culturais");
  redirect("/agricultura/tratos-culturais");
}

export async function updateTratoAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.tratosCulturais.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.tratoCultural.updateMany({
    where: { id, safra: { talhao: { organizationId } } },
    data: data as Prisma.TratoCulturalUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/tratos-culturais");
  redirect("/agricultura/tratos-culturais");
}

export async function deleteTratoAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.tratoCultural.deleteMany({ where: { id, safra: { talhao: { organizationId } } } });
  revalidatePath("/agricultura/tratos-culturais");
}
