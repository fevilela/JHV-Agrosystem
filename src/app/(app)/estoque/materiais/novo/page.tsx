import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getStockItemFields } from "../fields";
import { createStockItemAction } from "../actions";

export default async function NewStockItemPage() {
  const t = await getTranslations("estoque.materiais");
  const tCategory = await getTranslations("labels.stockCategory");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getStockItemFields(t, tCategory)}
        action={createStockItemAction}
        backHref="/estoque/materiais"
      />
    </div>
  );
}
