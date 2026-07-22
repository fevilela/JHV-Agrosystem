"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  const t = await getTranslations("agricultura.tratosCulturais.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

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
  const t = await getTranslations("agricultura.tratosCulturais.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.tratoCultural.update({
    where: { id },
    data: data as Prisma.TratoCulturalUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/tratos-culturais");
  redirect("/agricultura/tratos-culturais");
}

export async function deleteTratoAction(id: string) {
  await prisma.tratoCultural.delete({ where: { id } });
  revalidatePath("/agricultura/tratos-culturais");
}
