import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getApiOrgContext } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getAttendanceFields } from "@/app/(app)/rh/ponto/fields";

export async function POST(req: NextRequest) {
  const ctx = await getApiOrgContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) formData.set(key, value ?? "");

  const tf = await getTranslations("rh.ponto.fields");
  const tStatus = await getTranslations("labels.attendanceStatus");
  const t = await getTranslations("rh.ponto.errors");
  const data = buildRecordData(getAttendanceFields(tf, tStatus), formData);
  if (!data.employeeId) return NextResponse.json({ error: t("employeeRequired") }, { status: 400 });
  if (!data.date) return NextResponse.json({ error: t("dateRequired") }, { status: 400 });

  const employee = await prisma.employee.findFirst({
    where: { id: data.employeeId as string, organizationId: ctx.organizationId },
  });
  if (!employee) return NextResponse.json({ error: t("employeeRequired") }, { status: 400 });

  await prisma.attendance.create({ data: data as Prisma.AttendanceUncheckedCreateInput });

  revalidatePath("/rh/ponto");

  return NextResponse.json({ ok: true });
}
