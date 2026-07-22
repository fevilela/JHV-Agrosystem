import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getLoteFields } from "../../lote-fields";
import { createLoteAction } from "../../lote-actions";

export default async function NewLotePage() {
  const t = await getTranslations("pecuaria.lotes");
  const tf = await getTranslations("pecuaria.lotes.fields");
  const tCategory = await getTranslations("labels.livestockCategory");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getLoteFields(tf, tCategory)}
        action={createLoteAction}
        backHref="/pecuaria/manejo/lotes"
      />
    </div>
  );
}
