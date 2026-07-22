import type { RecordField } from "@/components/crud/record-form";

export function getStockBatchFields(t: (key: string) => string): RecordField[] {
  return [
    { name: "stockItemId", label: t("fields.stockItemId"), type: "relation", required: true },
    { name: "batchNumber", label: t("fields.batchNumber"), type: "text" },
    { name: "quantity", label: t("fields.quantity"), type: "number", required: true },
    { name: "expiryDate", label: t("fields.expiryDate"), type: "date" },
    { name: "entryDate", label: t("fields.entryDate"), type: "date" },
    { name: "supplierName", label: t("fields.supplierName"), type: "text" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
