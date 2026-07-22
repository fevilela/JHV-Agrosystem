import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, stockCategoryLabels } from "@/lib/labels";

export function getStockItemFields(
  t: (key: string) => string,
  tCategory: (key: string) => string
): RecordField[] {
  return [
    { name: "code", label: t("fields.code"), type: "text", required: true },
    { name: "name", label: t("fields.name"), type: "text", required: true, colSpan: 2 },
    {
      name: "category",
      label: t("fields.category"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(stockCategoryLabels, tCategory),
    },
    { name: "unit", label: t("fields.unit"), type: "text" },
    { name: "minQuantity", label: t("fields.minQuantity"), type: "number" },
    { name: "barcode", label: t("fields.barcode"), type: "text" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
