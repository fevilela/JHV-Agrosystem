import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getCostCenterFields } from "../fields";
import { createCostCenterAction } from "../actions";

export default async function NewCostCenterPage() {
  const t = await getTranslations("financeiro.centroCustos");
  const tf = await getTranslations("financeiro.centroCustos.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getCostCenterFields(tf)}
        action={createCostCenterAction}
        backHref="/financeiro/centro-custos"
      />
    </div>
  );
}
