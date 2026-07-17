import { prisma } from "@/lib/prisma";
import { JournalEntryForm } from "../journal-entry-form";
import { createJournalEntryAction } from "../actions";

export default async function NewJournalEntryPage() {
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, active: true },
    orderBy: { code: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Lançamento Contábil</h1>
      <JournalEntryForm
        accounts={accounts}
        action={createJournalEntryAction}
        backHref="/contabilidade/lancamentos"
      />
    </div>
  );
}
