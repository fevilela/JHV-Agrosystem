import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getApiOrgContext } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getHealthRecordFields } from "@/app/(app)/pecuaria/sanidade/fields";

export async function POST(req: NextRequest) {
  const ctx = await getApiOrgContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) formData.set(key, value ?? "");

  const tf = await getTranslations("pecuaria.sanidade.fields");
  const tType = await getTranslations("labels.healthRecordType");
  const t = await getTranslations("pecuaria.sanidade.errors");
  const data = buildRecordData(getHealthRecordFields(tf, tType), formData);
  if (!data.animalId) return NextResponse.json({ error: t("animalRequired") }, { status: 400 });
  if (!data.date) return NextResponse.json({ error: t("dateRequired") }, { status: 400 });

  const animal = await prisma.livestockAnimal.findFirst({
    where: { id: data.animalId as string, organizationId: ctx.organizationId },
  });
  if (!animal) return NextResponse.json({ error: t("animalRequired") }, { status: 400 });

  await prisma.healthRecord.create({ data: data as Prisma.HealthRecordUncheckedCreateInput });

  revalidatePath("/pecuaria/sanidade");

  return NextResponse.json({ ok: true });
}
