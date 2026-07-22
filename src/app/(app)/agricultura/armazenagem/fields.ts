import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, storageTypeLabels, storageMovementTypeLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getStorageFields(t: Translator, tType: Translator): RecordField[] {
  return [
    { name: "code", label: t("code"), type: "text", required: true },
    { name: "name", label: t("name"), type: "text" },
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(storageTypeLabels, tType),
    },
    { name: "capacityTon", label: t("capacityTon"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}

export function getStorageMovementFields(
  t: Translator,
  tMovementType: Translator
): RecordField[] {
  return [
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(storageMovementTypeLabels, tMovementType),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "safraId", label: t("safraId"), type: "relation" },
    { name: "quantityTon", label: t("quantityTon"), type: "number", required: true },
    { name: "umidade", label: t("umidade"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
