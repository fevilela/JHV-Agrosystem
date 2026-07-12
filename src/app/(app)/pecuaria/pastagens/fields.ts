import type { RecordField } from "@/components/crud/record-form";
import { toOptions, pastureRotationStatusLabels } from "@/lib/labels";

export const pastureFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text" },
  { name: "areaHectares", label: "Área (ha)", type: "number" },
  { name: "capacityHead", label: "Capacidade (cabeças)", type: "number" },
  {
    name: "rotationStatus",
    label: "Status de Rotação",
    type: "select",
    required: true,
    options: toOptions(pastureRotationStatusLabels),
  },
  { name: "grassHeightCm", label: "Altura do Capim (cm)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
