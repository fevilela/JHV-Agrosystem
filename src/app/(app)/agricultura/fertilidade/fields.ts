import type { RecordField } from "@/components/crud/record-form";
import { toOptions, fertilityTypeLabels } from "@/lib/labels";

export const fertilityFields: RecordField[] = [
  { name: "talhaoId", label: "Talhão", type: "relation", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(fertilityTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "ph", label: "pH", type: "number" },
  { name: "results", label: "Resultados", type: "textarea", colSpan: 2 },
  { name: "recommendation", label: "Recomendação", type: "textarea", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
