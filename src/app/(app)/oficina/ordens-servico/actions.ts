"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { buildRecordData } from "@/lib/record-data";
import { getServiceOrderFields } from "./fields";

type FormState = { error?: string } | undefined;

async function getFieldsAndT() {
  const t = await getTranslations("oficina.ordensServico");
  const tStatus = await getTranslations("labels.serviceOrderStatus");
  return { t, fields: getServiceOrderFields(t, tStatus) };
}

export async function createServiceOrderAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.machineId) return { error: t("errors.machineRequired") };
  if (!data.description) return { error: t("errors.descriptionRequired") };
  if (!data.openDate) return { error: t("errors.openDateRequired") };

  const machine = await prisma.machine.findFirst({
    where: { id: data.machineId as string, organizationId },
  });
  if (!machine) return { error: t("errors.machineRequired") };

  const order = await prisma.serviceOrder.create({
    data: data as Prisma.ServiceOrderUncheckedCreateInput,
  });

  revalidatePath("/oficina/ordens-servico");
  redirect(`/oficina/ordens-servico/${order.id}`);
}

export async function updateServiceOrderAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const { t, fields } = await getFieldsAndT();
  const data = buildRecordData(fields, formData);
  if (!data.machineId) return { error: t("errors.machineRequired") };
  if (!data.description) return { error: t("errors.descriptionRequired") };
  if (!data.openDate) return { error: t("errors.openDateRequired") };

  await prisma.serviceOrder.updateMany({
    where: { id, machine: { organizationId } },
    data: data as Prisma.ServiceOrderUncheckedUpdateInput,
  });

  revalidatePath("/oficina/ordens-servico");
  revalidatePath(`/oficina/ordens-servico/${id}`);
  redirect(`/oficina/ordens-servico/${id}`);
}

export async function deleteServiceOrderAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.serviceOrder.deleteMany({ where: { id, machine: { organizationId } } });
  revalidatePath("/oficina/ordens-servico");
  redirect("/oficina/ordens-servico");
}

export async function markServiceOrderCompletedAction(id: string) {
  const { organizationId } = await requireOrg();
  await prisma.serviceOrder.updateMany({
    where: { id, machine: { organizationId } },
    data: { status: "CONCLUIDA", closeDate: new Date() },
  });
  revalidatePath("/oficina/ordens-servico");
  revalidatePath(`/oficina/ordens-servico/${id}`);
}

export async function addServiceOrderPartAction(
  serviceOrderId: string,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const stockItemId = formData.get("stockItemId") as string | null;
  const quantityRaw = formData.get("quantity") as string | null;
  const unitCostRaw = formData.get("unitCost") as string | null;
  if (!stockItemId || !quantityRaw) return;

  const [order, stockItem] = await Promise.all([
    prisma.serviceOrder.findFirst({ where: { id: serviceOrderId, machine: { organizationId } } }),
    prisma.stockItem.findFirst({ where: { id: stockItemId, organizationId } }),
  ]);
  if (!order || !stockItem) return;

  const quantity = Number(quantityRaw);
  const unitCost = unitCostRaw ? Number(unitCostRaw) : null;

  await prisma.$transaction([
    prisma.serviceOrderPart.create({
      data: { serviceOrderId, stockItemId, quantity, unitCost },
    }),
    prisma.stockItem.update({
      where: { id: stockItemId },
      data: { currentQuantity: { decrement: quantity } },
    }),
  ]);

  revalidatePath(`/oficina/ordens-servico/${serviceOrderId}`);
  revalidatePath("/estoque/materiais");
}

export async function deleteServiceOrderPartAction(
  serviceOrderId: string,
  id: string
) {
  const { organizationId } = await requireOrg();
  const part = await prisma.serviceOrderPart.findFirst({
    where: { id, serviceOrder: { machine: { organizationId } } },
  });
  if (!part) return;

  await prisma.$transaction([
    prisma.serviceOrderPart.delete({ where: { id } }),
    prisma.stockItem.update({
      where: { id: part.stockItemId },
      data: { currentQuantity: { increment: part.quantity } },
    }),
  ]);

  revalidatePath(`/oficina/ordens-servico/${serviceOrderId}`);
  revalidatePath("/estoque/materiais");
}
