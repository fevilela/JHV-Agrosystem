import type { RecordField } from "@/components/crud/record-form";
import { toOptions, purchaseRequestStatusLabels } from "@/lib/labels";

export const purchaseRequestFields: RecordField[] = [
  { name: "description", label: "Descrição do Item", type: "text", required: true, colSpan: 2 },
  { name: "quantity", label: "Quantidade", type: "number", required: true },
  { name: "unit", label: "Unidade", type: "text" },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "requestedBy", label: "Solicitante", type: "text" },
  { name: "stockItemId", label: "Item de Estoque (opcional)", type: "relation" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(purchaseRequestStatusLabels),
  },
  { name: "justification", label: "Justificativa", type: "textarea", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
