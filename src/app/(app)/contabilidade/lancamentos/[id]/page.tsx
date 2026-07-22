import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { JournalEntryForm } from "../journal-entry-form";
import { updateJournalEntryAction } from "../actions";

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [entry, accounts] = await Promise.all([
    prisma.journalEntry.findUnique({ where: { id }, include: { lines: true } }),
    prisma.chartAccount.findMany({ where: { analytic: true, active: true }, orderBy: { code: "asc" } }),
  ]);

  if (!entry) notFound();

  const t = await getTranslations("contabilidade.lancamentos");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <JournalEntryForm
        accounts={accounts}
        action={updateJournalEntryAction.bind(null, id)}
        initialValues={{
          date: entry.date.toISOString().slice(0, 10),
          description: entry.description,
          lines: entry.lines.map((l) => ({
            accountId: l.accountId,
            type: l.type,
            amount: l.amount.toString(),
          })),
        }}
        backHref="/contabilidade/lancamentos"
      />
    </div>
  );
}
