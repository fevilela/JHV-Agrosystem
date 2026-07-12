import type { RecordField } from "@/components/crud/record-form";
import { toOptions, livestockCategoryLabels } from "@/lib/labels";

export const loteFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text" },
  {
    name: "category",
    label: "Categoria",
    type: "select",
    options: toOptions(livestockCategoryLabels),
  },
  { name: "description", label: "Descrição", type: "textarea", colSpan: 2 },
];
