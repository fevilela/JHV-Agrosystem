"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildRecordData } from "@/lib/record-data";
import { getPaymentClient, identificationFromCpfCnpj, splitName } from "@/lib/mercadopago";
import { receivableFields } from "./fields";

type FormState = { error?: string } | undefined;

export async function createReceivableAction(
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(receivableFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dueDate) return { error: "Informe o vencimento." };

  await prisma.financeEntry.create({
    data: { ...data, type: "RECEBER" } as Prisma.FinanceEntryUncheckedCreateInput,
  });

  revalidatePath("/financeiro/contas-receber");
  redirect("/financeiro/contas-receber");
}

export async function updateReceivableAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const data = buildRecordData(receivableFields, formData);
  if (!data.description) return { error: "Informe a descrição." };
  if (!data.amount) return { error: "Informe o valor." };
  if (!data.dueDate) return { error: "Informe o vencimento." };

  await prisma.financeEntry.update({
    where: { id },
    data: data as Prisma.FinanceEntryUncheckedUpdateInput,
  });

  revalidatePath("/financeiro/contas-receber");
  redirect("/financeiro/contas-receber");
}

export async function deleteReceivableAction(id: string) {
  await prisma.financeEntry.delete({ where: { id } });
  revalidatePath("/financeiro/contas-receber");
}

export async function markReceivableReceivedAction(id: string) {
  await prisma.financeEntry.update({
    where: { id },
    data: { status: "PAGO", paymentDate: new Date() },
  });
  revalidatePath("/financeiro/contas-receber");
}

type BoletoState = { error?: string } | undefined;

export async function gerarBoletoAction(
  id: string,
  _prevState: BoletoState
): Promise<BoletoState> {
  const entry = await prisma.financeEntry.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!entry) return { error: "Conta a receber não encontrada." };
  if (entry.mpPaymentId) return undefined;
  if (!entry.client) return { error: "Selecione um cliente para gerar o boleto." };

  const client = entry.client;
  if (!client.cpfCnpj) return { error: "Cadastre o CPF/CNPJ do cliente antes de gerar o boleto." };
  if (!client.email) return { error: "Cadastre o e-mail do cliente antes de gerar o boleto." };
  if (!client.address || !client.streetNumber || !client.neighborhood || !client.zipCode || !client.city || !client.state) {
    return { error: "Complete o endereço do cliente (CEP, rua, número, bairro, cidade e UF) antes de gerar o boleto." };
  }

  const identification = identificationFromCpfCnpj(client.cpfCnpj);
  if (!identification) return { error: "CPF/CNPJ do cliente é inválido." };

  const { first_name, last_name } = splitName(client.name);

  try {
    const payment = await getPaymentClient().create({
      body: {
        transaction_amount: Number(entry.amount),
        description: entry.description,
        payment_method_id: "bolbradesco",
        external_reference: entry.id,
        date_of_expiration: new Date(
          new Date(entry.dueDate).setHours(23, 59, 0, 0)
        ).toISOString(),
        notification_url:
          process.env.NEXTAUTH_URL && !/localhost|127\.0\.0\.1/.test(process.env.NEXTAUTH_URL)
            ? `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`
            : undefined,
        payer: {
          email: client.email,
          first_name,
          last_name,
          identification: {
            type: identification.type,
            number: identification.number,
          },
          address: {
            zip_code: client.zipCode,
            street_name: client.address,
            street_number: client.streetNumber,
            neighborhood: client.neighborhood,
            city: client.city,
            federal_unit: client.state,
          },
        },
      },
      requestOptions: { idempotencyKey: randomUUID() },
    });

    await prisma.financeEntry.update({
      where: { id },
      data: {
        mpPaymentId: String(payment.id),
        boletoUrl:
          payment.transaction_details?.external_resource_url ||
          payment.point_of_interaction?.transaction_data?.ticket_url ||
          null,
        boletoBarcode: payment.transaction_details?.barcode?.content || null,
        paymentMethod: "BOLETO",
      },
    });
  } catch (err) {
    console.error("Erro ao gerar boleto no Mercado Pago:", JSON.stringify(err, null, 2));
    const mpError = err as {
      message?: string;
      cause?: { code?: string; description?: string }[];
    };
    const detail = mpError?.cause?.map((c) => c.description).filter(Boolean).join("; ");
    const message =
      detail ||
      mpError?.message ||
      (err instanceof Error ? err.message : "Erro ao gerar boleto no Mercado Pago.");
    return { error: message };
  }

  revalidatePath("/financeiro/contas-receber");
  return undefined;
}
