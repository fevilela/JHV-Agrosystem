import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, managementMovementTypeLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getMovementFields(t: Translator, tType: Translator): RecordField[] {
  return [
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(managementMovementTypeLabels, tType),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "animalId", label: t("animalId"), type: "relation" },
    { name: "loteId", label: t("loteId"), type: "relation" },
    { name: "origin", label: t("origin"), type: "text" },
    { name: "destination", label: t("destination"), type: "text" },
    { name: "value", label: t("value"), type: "number" },
    { name: "counterpartyName", label: t("counterpartyName"), type: "text" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
