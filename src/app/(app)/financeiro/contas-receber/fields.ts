import type { RecordField } from "@/components/crud/record-form";
import { toOptions, financeEntryStatusLabels, paymentMethodLabels } from "@/lib/labels";

export const receivableFields: RecordField[] = [
  { name: "description", label: "Descrição", type: "text", required: true, colSpan: 2 },
  { name: "amount", label: "Valor (R$)", type: "number", required: true },
  { name: "dueDate", label: "Vencimento", type: "date", required: true },
  { name: "paymentDate", label: "Data de Recebimento", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(financeEntryStatusLabels),
  },
  {
    name: "paymentMethod",
    label: "Forma de Recebimento",
    type: "select",
    options: toOptions(paymentMethodLabels),
  },
  { name: "clientId", label: "Cliente", type: "relation" },
  { name: "costCenterId", label: "Centro de Custo", type: "relation" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
