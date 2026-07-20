"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/tenant";
import { renderContractPdf } from "@/lib/contract-pdf";
import { enviarContratoEmail } from "@/lib/email";
import { contractTypeLabels } from "@/lib/labels";
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

type EmailState = { error?: string; success?: true } | undefined;

export async function enviarContratoEmailAction(
  contractId: string,
  _prevState: EmailState
): Promise<EmailState> {
  const { organizationId } = await requireModule("hipica");

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, organizationId },
    include: { client: true, animal: true, stall: true, piquete: true },
  });
  if (!contract) return { error: "Contrato não encontrado." };
  if (!contract.client.email) {
    return { error: "Cadastre o e-mail do cliente antes de enviar o contrato." };
  }

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  const pdfBuffer = await renderContractPdf(contract, organization);
  const pdfFilename = `contrato-${contract.client.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  const resultado = await enviarContratoEmail({
    organizationId,
    email: contract.client.email,
    nomeCliente: contract.client.name,
    descricaoContrato: `${contractTypeLabels[contract.type]} — ${contract.client.name}`,
    pdfBuffer,
    pdfFilename,
  });

  if (resultado.error) return { error: resultado.error };
  if (resultado.skipped) {
    return {
      error:
        "Configure a Resend desta organização (Painel JHV → editar organização) antes de enviar contratos por e-mail.",
    };
  }

  revalidatePath(`/hipica/contratos/${contractId}`);
  return { success: true };
}
