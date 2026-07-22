"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";

type FormState = { error?: string } | undefined;

type ParsedLine = { accountId: string; type: "DEBITO" | "CREDITO"; amount: number };
type Translator = (key: string) => string;

async function parseAndValidateLines(
  linesJson: string,
  t: Translator
): Promise<ParsedLine[] | { error: string }> {
  let raw: { accountId: string; type: string; amount: string }[];
  try {
    raw = JSON.parse(linesJson);
  } catch {
    return { error: t("invalidLines") };
  }

  if (!Array.isArray(raw) || raw.length < 2) {
    return { error: t("minTwoLines") };
  }

  const lines: ParsedLine[] = [];
  for (const l of raw) {
    if (!l.accountId) return { error: t("accountRequired") };
    if (l.type !== "DEBITO" && l.type !== "CREDITO") return { error: t("invalidLineType") };
    const amount = Number(l.amount);
    if (!amount || amount <= 0) return { error: t("positiveAmountRequired") };
    lines.push({ accountId: l.accountId, type: l.type, amount });
  }

  const totalDebito = lines.filter((l) => l.type === "DEBITO").reduce((s, l) => s + l.amount, 0);
  const totalCredito = lines.filter((l) => l.type === "CREDITO").reduce((s, l) => s + l.amount, 0);
  if (Math.abs(totalDebito - totalCredito) >= 0.01) {
    return { error: t("unbalanced") };
  }

  return lines;
}

async function accountsBelongToOrg(accountIds: string[], organizationId: string) {
  const count = await prisma.chartAccount.count({
    where: { id: { in: accountIds }, organizationId },
  });
  return count === accountIds.length;
}

export async function createJournalEntryAction(
  _prevState: FormState,
  formData: FormData
) {
  const { organizationId } = await requireOrg();
  const t = await getTranslations("contabilidade.lancamentos.errors");
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const linesJson = formData.get("linesJson") as string;

  if (!date) return { error: t("dateRequired") };
  if (!description) return { error: t("descriptionRequired") };

  const result = await parseAndValidateLines(linesJson, t);
  if ("error" in result) return { error: result.error };

  const accountIds = [...new Set(result.map((l) => l.accountId))];
  if (!(await accountsBelongToOrg(accountIds, organizationId))) {
    return { error: t("accountRequired") };
  }

  await prisma.journalEntry.create({
    data: {
      date: new Date(date),
      description,
      organizationId,
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
  const { organizationId } = await requireOrg();
  const t = await getTranslations("contabilidade.lancamentos.errors");
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const linesJson = formData.get("linesJson") as string;

  if (!date) return { error: t("dateRequired") };
  if (!description) return { error: t("descriptionRequired") };

  const result = await parseAndValidateLines(linesJson, t);
  if ("error" in result) return { error: result.error };

  const accountIds = [...new Set(result.map((l) => l.accountId))];
  if (!(await accountsBelongToOrg(accountIds, organizationId))) {
    return { error: t("accountRequired") };
  }

  const existing = await prisma.journalEntry.findFirst({ where: { id, organizationId } });
  if (!existing) return { error: t("notFound") };

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
  const { organizationId } = await requireOrg();
  await prisma.journalEntry.deleteMany({ where: { id, organizationId } });
  revalidatePath("/contabilidade/lancamentos");
}
