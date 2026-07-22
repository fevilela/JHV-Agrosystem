import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, tratoCulturalTypeLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getTratoFields(t: Translator, tType: Translator): RecordField[] {
  return [
    { name: "safraId", label: t("safraId"), type: "relation", required: true },
    {
      name: "type",
      label: t("type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(tratoCulturalTypeLabels, tType),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "product", label: t("product"), type: "text" },
    { name: "dose", label: t("dose"), type: "text" },
    { name: "operador", label: t("operador"), type: "text" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
