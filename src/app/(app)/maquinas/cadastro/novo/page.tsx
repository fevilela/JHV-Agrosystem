import { getTranslations } from "next-intl/server";
import { RecordForm } from "@/components/crud/record-form";
import { getMachineFields } from "../fields";
import { createMachineAction } from "../actions";

export default async function NewMachinePage() {
  const t = await getTranslations("maquinas.cadastro");
  const tType = await getTranslations("labels.machineType");
  const tStatus = await getTranslations("labels.machineStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getMachineFields(t, tType, tStatus)}
        action={createMachineAction}
        initialValues={{ status: "ATIVO" }}
        backHref="/maquinas/cadastro"
      />
    </div>
  );
}
