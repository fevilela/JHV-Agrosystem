import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { JournalEntryForm } from "../journal-entry-form";
import { createJournalEntryAction } from "../actions";

export default async function NewJournalEntryPage() {
  const { organizationId } = await requireOrg();
  const accounts = await prisma.chartAccount.findMany({
    where: { analytic: true, active: true, organizationId },
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
