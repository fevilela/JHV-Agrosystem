import type { RecordField } from "@/components/crud/record-form";
import {
  toOptions,
  financialEntryTypeLabels,
  financialEntryStatusLabels,
} from "@/lib/labels";

export const financialFields: RecordField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(financialEntryTypeLabels),
  },
  { name: "description", label: "Descrição", type: "text", required: true, colSpan: 2 },
  { name: "amount", label: "Valor (R$)", type: "number", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(financialEntryStatusLabels),
  },
  { name: "dueDate", label: "Vencimento", type: "date" },
  { name: "paidDate", label: "Data de Pagamento", type: "date" },
  { name: "animalId", label: "Animal", type: "relation" },
  { name: "clientId", label: "Cliente", type: "relation" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
