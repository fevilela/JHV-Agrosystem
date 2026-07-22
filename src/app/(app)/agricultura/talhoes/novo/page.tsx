import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getTalhaoFields } from "../fields";
import { createTalhaoAction } from "../actions";

export default async function NewTalhaoPage() {
  const t = await getTranslations("agricultura.talhoes");
  const tf = await getTranslations("agricultura.talhoes.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getTalhaoFields(tf)}
        action={createTalhaoAction}
        backHref="/agricultura/talhoes"
      />
    </div>
  );
}
