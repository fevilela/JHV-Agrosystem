import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getFeedingFields } from "../fields";
import { createFeedingAction } from "../actions";

export default async function NewFeedingPage() {
  const lotes = await prisma.lote.findMany({ orderBy: { code: "asc" } });

  const t = await getTranslations("pecuaria.nutricao");
  const tf = await getTranslations("pecuaria.nutricao.fields");
  const tType = await getTranslations("labels.feedingType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getFeedingFields(tf, tType)}
        action={createFeedingAction}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/nutricao"
      />
    </div>
  );
}
