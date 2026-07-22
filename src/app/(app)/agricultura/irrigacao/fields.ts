import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getIrrigationFields(t: Translator): RecordField[] {
  return [
    { name: "talhaoId", label: t("talhaoId"), type: "relation", required: true },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "consumoM3", label: t("consumoM3"), type: "number" },
    { name: "horasBomba", label: t("horasBomba"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
