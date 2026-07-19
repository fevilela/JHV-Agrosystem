"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/tenant";
import type { ContractType } from "@prisma/client";

type FormState = { error?: string } | undefined;

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export async function createContractAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { organizationId } = await requireModule("hipica");

  const type = str(formData, "type") as ContractType | null;
  const clientId = str(formData, "clientId");
  const animalId = str(formData, "animalId");
  const stallId = str(formData, "stallId");
  const piqueteId = str(formData, "piqueteId");
  const monthlyValueRaw = str(formData, "monthlyValue");
  const dueDayRaw = str(formData, "dueDay");
  const startDateRaw = str(formData, "startDate");
  const notes = str(formData, "notes");

  if (!type) return { error: "Selecione o tipo de contrato." };
  if (!clientId) return { error: "Selecione o cliente." };
  if (!monthlyValueRaw) return { error: "Informe o valor mensal." };
  if (!startDateRaw) return { error: "Informe a data de início." };
  if (type === "BAIA" && !stallId) return { error: "Selecione a baia." };
  if (type === "PIQUETE" && !piqueteId) return { error: "Selecione o piquete." };

  const contract = await prisma.contract.create({
    data: {
      type,
      clientId,
      animalId,
      stallId: type === "BAIA" ? stallId : null,
      piqueteId: type === "PIQUETE" ? piqueteId : null,
      monthlyValue: Number(monthlyValueRaw),
      dueDay: dueDayRaw ? Number(dueDayRaw) : 10,
      startDate: new Date(startDateRaw),
      notes,
      organizationId,
    },
  });

  revalidatePath("/hipica/contratos");
  redirect(`/hipica/contratos/${contract.id}`);
}

export async function deleteContractAction(id: string) {
  const { organizationId } = await requireModule("hipica");
  await prisma.contract.deleteMany({ where: { id, organizationId } });
  revalidatePath("/hipica/contratos");
}
