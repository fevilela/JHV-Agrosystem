"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getHarvestFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createHarvestAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.colheita.errors");
  const tf = await getTranslations("agricultura.colheita.fields");
  const data = buildRecordData(getHarvestFields(tf), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  const safra = await prisma.safra.findFirst({
    where: { id: data.safraId as string, talhao: { organizationId } },
  });
  if (!safra) return { error: t("safraRequired") };

  await prisma.$transaction([
    prisma.harvest.create({
      data: data as Prisma.HarvestUncheckedCreateInput,
    }),
    prisma.safra.update({
      where: { id: data.safraId as string },
      data: { status: "COLHIDA" },
    }),
  ]);

  revalidatePath("/agricultura/colheita");
  revalidatePath("/agricultura/safra");
  redirect("/agricultura/colheita");
}

export async function updateHarvestAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("agricultura.colheita.errors");
  const tf = await getTranslations("agricultura.colheita.fields");
  const data = buildRecordData(getHarvestFields(tf), formData);
  if (!data.safraId) return { error: t("safraRequired") };
  if (!data.date) return { error: t("dateRequired") };

  await prisma.harvest.updateMany({
    where: { id, safra: { talhao: { organizationId } } },
    data: data as Prisma.HarvestUncheckedUpdateInput,
  });

  revalidatePath("/agricultura/colheita");
  redirect("/agricultura/colheita");
}

export async function deleteHarvestAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.harvest.deleteMany({ where: { id, safra: { talhao: { organizationId } } } });
  revalidatePath("/agricultura/colheita");
}
