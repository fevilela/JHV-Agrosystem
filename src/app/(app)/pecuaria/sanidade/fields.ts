import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, healthRecordTypeLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getHealthRecordFields(t: Translator, tType: Translator): RecordField[] {
  return [
    { name: "animalId", label: t("animalId"), type: "relation", required: true },
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(healthRecordTypeLabels, tType),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "product", label: t("product"), type: "text" },
    { name: "nextDoseDate", label: t("nextDoseDate"), type: "date" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
