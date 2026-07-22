import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getStorageFields } from "../fields";
import { createStorageAction } from "../actions";

export default async function NewStoragePage() {
  const t = await getTranslations("agricultura.armazenagem");
  const tf = await getTranslations("agricultura.armazenagem.fields");
  const tType = await getTranslations("labels.storageType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getStorageFields(tf, tType)}
        action={createStorageAction}
        initialValues={{ type: "SILO" }}
        backHref="/agricultura/armazenagem"
      />
    </div>
  );
}
