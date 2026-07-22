import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getPastureFields } from "../fields";
import { createPastureAction } from "../actions";

export default async function NewPasturePage() {
  const t = await getTranslations("pecuaria.pastagens");
  const tf = await getTranslations("pecuaria.pastagens.fields");
  const tStatus = await getTranslations("labels.pastureRotationStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getPastureFields(tf, tStatus)}
        action={createPastureAction}
        initialValues={{ rotationStatus: "EM_USO" }}
        backHref="/pecuaria/pastagens"
      />
    </div>
  );
}
