import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, livestockCategoryLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getLoteFields(t: Translator, tCategory: Translator): RecordField[] {
  return [
    { name: "code", label: t("code"), type: "text", required: true },
    { name: "name", label: t("name"), type: "text" },
    {
      name: "category",
      label: t("category"),
      type: "select",
      options: toOptionsFromKeys(livestockCategoryLabels, tCategory),
    },
    { name: "description", label: t("description"), type: "textarea", colSpan: 2 },
  ];
}
