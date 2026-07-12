import type { RecordField } from "@/components/crud/record-form";
import { toOptions, tratoCulturalTypeLabels } from "@/lib/labels";

export const tratoFields: RecordField[] = [
  { name: "safraId", label: "Safra", type: "relation", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(tratoCulturalTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "product", label: "Produto", type: "text" },
  { name: "dose", label: "Dose", type: "text" },
  { name: "operador", label: "Operador", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
