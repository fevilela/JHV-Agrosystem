"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type FormState = { error?: string } | undefined;

type ParsedLine = { accountId: string; type: "DEBITO" | "CREDITO"; amount: number };

function parseAndValidateLines(linesJson: string): ParsedLine[] | { error: string } {
  let raw: { accountId: string; type: string; amount: string }[];
  try {
    raw = JSON.parse(linesJson);
  } catch {
    return { error: "Partidas inválidas." };
  }

  if (!Array.isArray(raw) || raw.length < 2) {
    return { error: "Um lançamento precisa de pelo menos duas partidas." };
  }

  const lines: ParsedLine[] = [];
  for (const l of raw) {
    if (!l.accountId) return { error: "Selecione a conta em todas as partidas." };
    if (l.type !== "DEBITO" && l.type !== "CREDITO") return { error: "Tipo de partida inválido." };
    const amount = Number(l.amount);
    if (!amount || amount <= 0) return { error: "Informe um valor maior que zero em todas as partidas." };
    lines.push({ accountId: l.accountId, type: l.type, amount });
  }

  const totalDebito = lines.filter((l) => l.type === "DEBITO").reduce((s, l) => s + l.amount, 0);
  const totalCredito = lines.filter((l) => l.type === "CREDITO").reduce((s, l) => s + l.amount, 0);
  if (Math.abs(totalDebito - totalCredito) >= 0.01) {
    return { error: "O lançamento não fecha: o total de débito precisa ser igual ao total de crédito." };
  }

  return lines;
}

export async function createJournalEntryAction(
  _prevState: FormState,
  formData: FormData
) {
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const linesJson = formData.get("linesJson") as string;

  if (!date) return { error: "Informe a data." };
  if (!description) return { error: "Informe a descrição." };

  const result = parseAndValidateLines(linesJson);
  if ("error" in result) return { error: result.error };

  await prisma.journalEntry.create({
    data: {
      date: new Date(date),
      description,
      lines: {
        create: result.map((l) => ({
          accountId: l.accountId,
          type: l.type,
          amount: l.amount,
        })),
      },
    },
  });

  revalidatePath("/contabilidade/lancamentos");
  redirect("/contabilidade/lancamentos");
}

export async function updateJournalEntryAction(
  id: string,
  _prevState: FormState,
  formData: FormData
) {
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const linesJson = formData.get("linesJson") as string;

  if (!date) return { error: "Informe a data." };
  if (!description) return { error: "Informe a descrição." };

  const result = parseAndValidateLines(linesJson);
  if ("error" in result) return { error: result.error };

  await prisma.$transaction([
    prisma.journalEntryLine.deleteMany({ where: { journalEntryId: id } }),
    prisma.journalEntry.update({
      where: { id },
      data: {
        date: new Date(date),
        description,
        lines: {
          create: result.map((l) => ({
            accountId: l.accountId,
            type: l.type,
            amount: l.amount,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/contabilidade/lancamentos");
  redirect("/contabilidade/lancamentos");
}

export async function deleteJournalEntryAction(id: string) {
  await prisma.journalEntry.delete({ where: { id } });
  revalidatePath("/contabilidade/lancamentos");
}
