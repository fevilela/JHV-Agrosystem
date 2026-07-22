import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getFeedingFields } from "../fields";
import { updateFeedingAction } from "../actions";

export default async function EditFeedingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [feeding, lotes] = await Promise.all([
    prisma.livestockFeeding.findUnique({ where: { id } }),
    prisma.lote.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!feeding) notFound();

  const t = await getTranslations("pecuaria.nutricao");
  const tf = await getTranslations("pecuaria.nutricao.fields");
  const tType = await getTranslations("labels.feedingType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getFeedingFields(tf, tType)}
        action={updateFeedingAction.bind(null, id)}
        initialValues={feeding}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/nutricao"
      />
    </div>
  );
}
