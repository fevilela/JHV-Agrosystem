import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, purchaseOrderStatusLabels } from "@/lib/labels";

export function getPurchaseOrderFields(
  t: (key: string) => string,
  tStatus: (key: string) => string
): RecordField[] {
  return [
    { name: "supplierId", label: t("fields.supplierId"), type: "relation", required: true },
    { name: "quotationId", label: t("fields.quotationId"), type: "relation" },
    { name: "orderDate", label: t("fields.orderDate"), type: "date", required: true },
    { name: "expectedDeliveryDate", label: t("fields.expectedDeliveryDate"), type: "date" },
    { name: "actualDeliveryDate", label: t("fields.actualDeliveryDate"), type: "date" },
    { name: "invoiceNumber", label: t("fields.invoiceNumber"), type: "text" },
    { name: "totalValue", label: t("fields.totalValue"), type: "number" },
    {
      name: "status",
      label: t("fields.status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(purchaseOrderStatusLabels, tStatus),
    },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
