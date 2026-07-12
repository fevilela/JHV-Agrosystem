import type { RecordField } from "@/components/crud/record-form";
import { toOptions, managementMovementTypeLabels } from "@/lib/labels";

export const movementFields: RecordField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(managementMovementTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "animalId", label: "Animal", type: "relation" },
  { name: "loteId", label: "Lote", type: "relation" },
  { name: "origin", label: "Origem", type: "text" },
  { name: "destination", label: "Destino", type: "text" },
  { name: "value", label: "Valor (R$)", type: "number" },
  { name: "counterpartyName", label: "Contraparte", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
