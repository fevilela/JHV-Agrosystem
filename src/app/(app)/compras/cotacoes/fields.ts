import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, quotationStatusLabels } from "@/lib/labels";

export function getQuotationFields(
  t: (key: string) => string,
  tStatus: (key: string) => string
): RecordField[] {
  return [
    { name: "supplierId", label: t("fields.supplierId"), type: "relation", required: true },
    { name: "purchaseRequestId", label: t("fields.purchaseRequestId"), type: "relation" },
    { name: "description", label: t("fields.description"), type: "text", colSpan: 2 },
    { name: "quantity", label: t("fields.quantity"), type: "number" },
    { name: "unitPrice", label: t("fields.unitPrice"), type: "number" },
    { name: "totalValue", label: t("fields.totalValue"), type: "number" },
    { name: "validUntil", label: t("fields.validUntil"), type: "date" },
    {
      name: "status",
      label: t("fields.status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(quotationStatusLabels, tStatus),
    },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
