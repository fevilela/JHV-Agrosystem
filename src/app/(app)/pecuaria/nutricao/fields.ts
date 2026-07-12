import type { RecordField } from "@/components/crud/record-form";
import { toOptions, feedingTypeLabels } from "@/lib/labels";

export const feedingFields: RecordField[] = [
  { name: "loteId", label: "Lote", type: "relation", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(feedingTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "silagemKg", label: "Silagem (kg)", type: "number" },
  { name: "suplementacaoKg", label: "Suplementação (kg)", type: "number" },
  { name: "consumoKg", label: "Consumo Total (kg)", type: "number" },
  { name: "custoDiario", label: "Custo Diário (R$)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
