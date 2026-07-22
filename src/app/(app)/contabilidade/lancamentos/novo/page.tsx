import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { JournalEntryForm } from "../journal-entry-form";
import { createJournalEntryAction } from "../actions";

export default async function NewJournalEntryPage() {
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, active: true },
    orderBy: { code: "asc" },
  });
  const t = await getTranslations("contabilidade.lancamentos");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newDetail")}</h1>
      <JournalEntryForm
        accounts={accounts}
        action={createJournalEntryAction}
        backHref="/contabilidade/lancamentos"
      />
    </div>
  );
}
