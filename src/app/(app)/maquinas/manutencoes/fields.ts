import type { RecordField } from "@/components/crud/record-form";
import { toOptions, maintenanceTypeLabels } from "@/lib/labels";

export const maintenanceFields: RecordField[] = [
  { name: "machineId", label: "Máquina", type: "relation", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(maintenanceTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "description", label: "Descrição", type: "text", colSpan: 2 },
  { name: "cost", label: "Custo (R$)", type: "number" },
  { name: "horimetro", label: "Horímetro na Manutenção (h)", type: "number" },
  { name: "nextDueDate", label: "Próxima Manutenção (data)", type: "date" },
  { name: "nextDueHorimetro", label: "Próxima Manutenção (horímetro)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
