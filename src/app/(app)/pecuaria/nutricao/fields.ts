import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, feedingTypeLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getFeedingFields(t: Translator, tType: Translator): RecordField[] {
  return [
    { name: "loteId", label: t("loteId"), type: "relation", required: true },
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(feedingTypeLabels, tType),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "silagemKg", label: t("silagemKg"), type: "number" },
    { name: "suplementacaoKg", label: t("suplementacaoKg"), type: "number" },
    { name: "consumoKg", label: t("consumoKg"), type: "number" },
    { name: "custoDiario", label: t("custoDiario"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
