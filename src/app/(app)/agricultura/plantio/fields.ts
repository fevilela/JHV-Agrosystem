import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getPlantioFields(t: Translator): RecordField[] {
  return [
    { name: "safraId", label: t("safraId"), type: "relation", required: true },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "sementes", label: t("sementes"), type: "text" },
    { name: "populacaoPlantasHa", label: t("populacaoPlantasHa"), type: "number" },
    { name: "maquina", label: t("maquina"), type: "text" },
    { name: "operador", label: t("operador"), type: "text" },
    { name: "tempoHoras", label: t("tempoHoras"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
