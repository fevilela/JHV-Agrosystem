import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getApiOrgContext } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getWeightFields } from "@/app/(app)/pecuaria/pesagens/fields";

export async function POST(req: NextRequest) {
  const ctx = await getApiOrgContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) formData.set(key, value ?? "");

  const tf = await getTranslations("pecuaria.pesagens.fields");
  const t = await getTranslations("pecuaria.pesagens.errors");
  const data = buildRecordData(getWeightFields(tf), formData);
  if (!data.animalId) return NextResponse.json({ error: t("animalRequired") }, { status: 400 });
  if (!data.date) return NextResponse.json({ error: t("dateRequired") }, { status: 400 });
  if (!data.weightKg) return NextResponse.json({ error: t("weightRequired") }, { status: 400 });

  const animal = await prisma.livestockAnimal.findFirst({
    where: { id: data.animalId as string, organizationId: ctx.organizationId },
  });
  if (!animal) return NextResponse.json({ error: t("animalRequired") }, { status: 400 });

  await prisma.$transaction([
    prisma.weightRecord.create({ data: data as Prisma.WeightRecordUncheckedCreateInput }),
    prisma.livestockAnimal.update({
      where: { id: data.animalId as string },
      data: { pesoAtual: data.weightKg as Prisma.Decimal | number },
    }),
  ]);

  revalidatePath("/pecuaria/pesagens");
  revalidatePath("/pecuaria/cadastro-animal");

  return NextResponse.json({ ok: true });
}
