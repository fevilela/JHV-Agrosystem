import type { RecordField } from "@/components/crud/record-form";
import { toOptions, serviceOrderStatusLabels } from "@/lib/labels";

export const serviceOrderFields: RecordField[] = [
  { name: "machineId", label: "Máquina", type: "relation", required: true },
  { name: "mechanicId", label: "Mecânico", type: "relation" },
  { name: "description", label: "Descrição do Serviço", type: "text", required: true, colSpan: 2 },
  { name: "openDate", label: "Data de Abertura", type: "date", required: true },
  { name: "closeDate", label: "Data de Fechamento", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(serviceOrderStatusLabels),
  },
  { name: "laborCost", label: "Mão de Obra (R$)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
