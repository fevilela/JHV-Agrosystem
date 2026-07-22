"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { logAudit } from "@/lib/audit";
import { getPayableFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFields() {
  const tf = await getTranslations("financeiro.contasPagar.fields");
  const tStatus = await getTranslations("labels.financeEntryStatus");
  const tPaymentMethod = await getTranslations("labels.paymentMethod");
  return getPayableFields(tf, tStatus, tPaymentMethod);
}

export async function createPayableAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId, userId, userName } = await requireOrg();
  const t = await getTranslations("financeiro.contasPagar.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  const entry = await prisma.financeEntry.create({
    data: { ...data, type: "PAGAR", organizationId } as Prisma.FinanceEntryUncheckedCreateInput,
  });
  await logAudit({
    organizationId,
    userId,
    userName,
    action: "CREATE",
    entityType: "financeEntry",
    entityId: entry.id,
    after: entry,
  });

  revalidatePath("/financeiro/contas-pagar");
  redirect("/financeiro/contas-pagar");
}

export async function updatePayableAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId, userId, userName } = await requireOrg();
  const t = await getTranslations("financeiro.contasPagar.errors");
  const data = buildRecordData(await getFields(), formData);
  if (!data.description) return { error: t("descriptionRequired") };
  if (!data.amount) return { error: t("amountRequired") };
  if (!data.dueDate) return { error: t("dueDateRequired") };

  const before = await prisma.financeEntry.findFirst({ where: { id, organizationId } });
  await prisma.financeEntry.updateMany({
    where: { id, organizationId },
    data: data as Prisma.FinanceEntryUncheckedUpdateInput,
  });
  if (before) {
    await logAudit({
      organizationId,
      userId,
      userName,
      action: "UPDATE",
      entityType: "financeEntry",
      entityId: id,
      before,
      after: { ...before, ...data },
    });
  }

  revalidatePath("/financeiro/contas-pagar");
  redirect("/financeiro/contas-pagar");
}

export async function deletePayableAction(id: string) {
  const { organizationId, userId, userName } = await requireOrg();
  const before = await prisma.financeEntry.findFirst({ where: { id, organizationId } });
  await prisma.financeEntry.deleteMany({ where: { id, organizationId } });
  if (before) {
    await logAudit({
      organizationId,
      userId,
      userName,
      action: "DELETE",
      entityType: "financeEntry",
      entityId: id,
      before,
    });
  }
  revalidatePath("/financeiro/contas-pagar");
}

export async function markPayablePaidAction(id: string) {
  const { organizationId, userId, userName } = await requireOrg();
  const before = await prisma.financeEntry.findFirst({ where: { id, organizationId } });
  await prisma.financeEntry.updateMany({
    where: { id, organizationId },
    data: { status: "PAGO", paymentDate: new Date() },
  });
  if (before) {
    await logAudit({
      organizationId,
      userId,
      userName,
      action: "UPDATE",
      entityType: "financeEntry",
      entityId: id,
      before,
      after: { ...before, status: "PAGO", paymentDate: new Date() },
    });
  }
  revalidatePath("/financeiro/contas-pagar");
}
