import type { RecordField } from "@/components/crud/record-form";
import { toOptions, storageTypeLabels, storageMovementTypeLabels } from "@/lib/labels";

export const storageFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text" },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(storageTypeLabels),
  },
  { name: "capacityTon", label: "Capacidade (ton)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];

export const storageMovementFields: RecordField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(storageMovementTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "safraId", label: "Safra", type: "relation" },
  { name: "quantityTon", label: "Quantidade (ton)", type: "number", required: true },
  { name: "umidade", label: "Umidade (%)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
