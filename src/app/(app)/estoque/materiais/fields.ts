import type { RecordField } from "@/components/crud/record-form";
import { toOptions, stockCategoryLabels } from "@/lib/labels";

export const stockItemFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
  {
    name: "category",
    label: "Categoria",
    type: "select",
    required: true,
    options: toOptions(stockCategoryLabels),
  },
  { name: "unit", label: "Unidade (kg, L, un...)", type: "text" },
  { name: "minQuantity", label: "Estoque Mínimo", type: "number" },
  { name: "barcode", label: "Código de Barras / QR Code", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
