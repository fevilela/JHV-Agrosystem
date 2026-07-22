import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getApiOrgContext } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getTratoFields } from "@/app/(app)/agricultura/tratos-culturais/fields";

export async function POST(req: NextRequest) {
  const ctx = await getApiOrgContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) formData.set(key, value ?? "");

  const tf = await getTranslations("agricultura.tratosCulturais.fields");
  const tType = await getTranslations("labels.tratoCulturalType");
  const t = await getTranslations("agricultura.tratosCulturais.errors");
  const data = buildRecordData(getTratoFields(tf, tType), formData);
  if (!data.safraId) return NextResponse.json({ error: t("safraRequired") }, { status: 400 });
  if (!data.date) return NextResponse.json({ error: t("dateRequired") }, { status: 400 });

  const safra = await prisma.safra.findFirst({
    where: { id: data.safraId as string, talhao: { organizationId: ctx.organizationId } },
  });
  if (!safra) return NextResponse.json({ error: t("safraRequired") }, { status: 400 });

  await prisma.tratoCultural.create({ data: data as Prisma.TratoCulturalUncheckedCreateInput });

  revalidatePath("/agricultura/tratos-culturais");

  return NextResponse.json({ ok: true });
}
