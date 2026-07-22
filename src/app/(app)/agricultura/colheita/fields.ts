import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getHarvestFields(t: Translator): RecordField[] {
  return [
    { name: "safraId", label: t("safraId"), type: "relation", required: true },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "producaoKg", label: t("producaoKg"), type: "number" },
    { name: "umidade", label: t("umidade"), type: "number" },
    { name: "qualidade", label: t("qualidade"), type: "text" },
    { name: "maquina", label: t("maquina"), type: "text" },
    { name: "operador", label: t("operador"), type: "text" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
