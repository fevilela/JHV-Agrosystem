import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getMechanicFields } from "../fields";
import { createMechanicAction } from "../actions";

export default async function NewMechanicPage() {
  const t = await getTranslations("oficina.pecas");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getMechanicFields(t)}
        action={createMechanicAction}
        initialValues={{ active: true }}
        backHref="/oficina/pecas"
      />
    </div>
  );
}
