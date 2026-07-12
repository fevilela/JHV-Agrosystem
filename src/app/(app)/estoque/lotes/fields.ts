import type { RecordField } from "@/components/crud/record-form";

export const stockBatchFields: RecordField[] = [
  { name: "stockItemId", label: "Item", type: "relation", required: true },
  { name: "batchNumber", label: "Número do Lote", type: "text" },
  { name: "quantity", label: "Quantidade", type: "number", required: true },
  { name: "expiryDate", label: "Validade", type: "date" },
  { name: "entryDate", label: "Data de Entrada", type: "date" },
  { name: "supplierName", label: "Fornecedor", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
