import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, fertilityTypeLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getFertilityFields(t: Translator, tType: Translator): RecordField[] {
  return [
    { name: "talhaoId", label: t("talhaoId"), type: "relation", required: true },
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(fertilityTypeLabels, tType),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "ph", label: t("ph"), type: "number" },
    { name: "results", label: t("results"), type: "textarea", colSpan: 2 },
    { name: "recommendation", label: t("recommendation"), type: "textarea", colSpan: 2 },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
