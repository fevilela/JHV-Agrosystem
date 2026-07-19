import { randomUUID } from "crypto";
import { differenceInCalendarDays, addDays, endOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getPaymentClient, identificationFromCpfCnpj, splitName } from "@/lib/mercadopago";
import { enviarBoletoWhatsapp } from "@/lib/whatsapp";
import { formatCurrency, formatDate } from "@/lib/labels";

export const MULTA_PCT = 0.02;
export const JUROS_MENSAL_PCT = 0.01;

export function calcularValorComJuros(valorOriginal: number, diasAtraso: number) {
  if (diasAtraso <= 0) return valorOriginal;
  const multa = valorOriginal * MULTA_PCT;
  const juros = valorOriginal * JUROS_MENSAL_PCT * (diasAtraso / 30);
  return Math.round((valorOriginal + multa + juros) * 100) / 100;
}

function extrairMensagemErro(err: unknown) {
  console.error("Erro ao gerar boleto no Mercado Pago:", JSON.stringify(err, null, 2));
  const mpError = err as {
    message?: string;
    cause?: { code?: string; description?: string }[];
  };
  const detail = mpError?.cause?.map((c) => c.description).filter(Boolean).join("; ");
  const rawMessage =
    detail ||
    mpError?.message ||
    (err instanceof Error ? err.message : "Erro ao gerar boleto no Mercado Pago.");
  return rawMessage === "Invalid transaction_amount"
    ? "O valor da conta é muito baixo para gerar boleto no Mercado Pago. Tente um valor maior (R$ 10 ou mais)."
    : rawMessage;
}

export async function gerarBoletoParaConta(
  entryId: string,
  valorOverride?: number
): Promise<{ error?: string }> {
  const entry = await prisma.financeEntry.findUnique({
    where: { id: entryId },
    include: { client: true },
  });

  if (!entry) return { error: "Conta a receber não encontrada." };
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
  const valor = valorOverride ?? Number(entry.amount);
  const hoje = new Date();
  const vencimentoOriginal = new Date(entry.dueDate);
  const expiracao =
    vencimentoOriginal > hoje ? endOfDay(vencimentoOriginal) : addDays(hoje, 5);

  try {
    const payment = await getPaymentClient().create({
      body: {
        transaction_amount: valor,
        description: entry.description,
        payment_method_id: "bolbradesco",
        external_reference: entry.id,
        date_of_expiration: expiracao.toISOString(),
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

    const boletoUrl =
      payment.transaction_details?.external_resource_url ||
      payment.point_of_interaction?.transaction_data?.ticket_url ||
      null;

    await prisma.financeEntry.update({
      where: { id: entryId },
      data: {
        mpPaymentId: String(payment.id),
        boletoUrl,
        boletoBarcode: payment.transaction_details?.barcode?.content || null,
        paymentMethod: "BOLETO",
        amount: valor,
        originalAmount: entry.originalAmount ?? entry.amount,
      },
    });

    if (boletoUrl && client.phone) {
      try {
        const resultado = await enviarBoletoWhatsapp({
          telefone: client.phone,
          nomeCliente: client.name,
          descricao: entry.description,
          valorFormatado: formatCurrency(valor),
          vencimentoFormatado: formatDate(entry.dueDate),
          boletoUrl,
        });
        if (resultado.error) console.error("Erro ao enviar boleto via WhatsApp:", resultado.error);
      } catch (err) {
        console.error("Erro ao enviar boleto via WhatsApp:", err);
      }
    }
  } catch (err) {
    return { error: extrairMensagemErro(err) };
  }

  return {};
}

export async function processarRecorrencias(hoje = new Date()) {
  const dia = hoje.getDate();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const templates = await prisma.recurringBilling.findMany({
    where: { active: true, dayOfMonth: dia },
    include: { client: true },
  });

  const resultado = { criadas: 0, erros: [] as string[] };

  for (const t of templates) {
    const jaExiste = await prisma.financeEntry.findFirst({
      where: { recurringBillingId: t.id, createdAt: { gte: inicioMes } },
    });
    if (jaExiste) continue;

    const vencimentoDia = t.dueDay ?? dia;
    const mesVencimento = vencimentoDia < dia ? hoje.getMonth() + 1 : hoje.getMonth();
    const dueDate = new Date(Date.UTC(hoje.getFullYear(), mesVencimento, vencimentoDia));

    const entry = await prisma.financeEntry.create({
      data: {
        type: "RECEBER",
        description: t.description,
        amount: t.amount,
        originalAmount: t.amount,
        dueDate,
        status: "PENDENTE",
        paymentMethod: "BOLETO",
        clientId: t.clientId,
        recurringBillingId: t.id,
      },
    });

    const boleto = await gerarBoletoParaConta(entry.id);
    if (boleto.error) resultado.erros.push(`${t.client.name}: ${boleto.error}`);
    else resultado.criadas++;
  }

  return resultado;
}

export async function reemitirBoletosAtrasados(hoje = new Date()) {
  const entradas = await prisma.financeEntry.findMany({
    where: {
      type: "RECEBER",
      status: { in: ["PENDENTE", "ATRASADO"] },
      paymentMethod: "BOLETO",
      mpPaymentId: { not: null },
      dueDate: { lt: hoje },
    },
  });

  const resultado = { reemitidas: 0, erros: [] as string[] };

  for (const e of entradas) {
    const base = Number(e.originalAmount ?? e.amount);
    const diasAtraso = differenceInCalendarDays(hoje, e.dueDate);
    const novoValor = calcularValorComJuros(base, diasAtraso);

    if (Math.abs(novoValor - Number(e.amount)) < 0.01) continue;

    if (e.mpPaymentId) {
      try {
        await getPaymentClient().cancel({ id: e.mpPaymentId });
      } catch {
        // o pagamento pode já não estar em um status cancelável; seguimos mesmo assim
      }
    }

    await prisma.financeEntry.update({
      where: { id: e.id },
      data: {
        amount: novoValor,
        status: "ATRASADO",
        mpPaymentId: null,
        boletoUrl: null,
        boletoBarcode: null,
      },
    });

    const boleto = await gerarBoletoParaConta(e.id);
    if (boleto.error) resultado.erros.push(`${e.description}: ${boleto.error}`);
    else resultado.reemitidas++;
  }

  return resultado;
}
