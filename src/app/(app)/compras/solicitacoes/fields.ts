import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, purchaseRequestStatusLabels } from "@/lib/labels";

export function getPurchaseRequestFields(
  t: (key: string) => string,
  tStatus: (key: string) => string
): RecordField[] {
  return [
    { name: "description", label: t("fields.description"), type: "text", required: true, colSpan: 2 },
    { name: "quantity", label: t("fields.quantity"), type: "number", required: true },
    { name: "unit", label: t("fields.unit"), type: "text" },
    { name: "date", label: t("fields.date"), type: "date", required: true },
    { name: "requestedBy", label: t("fields.requestedBy"), type: "text" },
    { name: "stockItemId", label: t("fields.stockItemId"), type: "relation" },
    {
      name: "status",
      label: t("fields.status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(purchaseRequestStatusLabels, tStatus),
    },
    { name: "justification", label: t("fields.justification"), type: "textarea", colSpan: 2 },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
