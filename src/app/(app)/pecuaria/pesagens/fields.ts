import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getWeightFields(t: Translator): RecordField[] {
  return [
    { name: "animalId", label: t("animalId"), type: "relation", required: true },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "weightKg", label: t("weightKg"), type: "number", required: true },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
