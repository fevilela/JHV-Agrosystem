import type { RecordField } from "@/components/crud/record-form";
import { toOptions, financeEntryStatusLabels, paymentMethodLabels } from "@/lib/labels";

export const payableFields: RecordField[] = [
  { name: "description", label: "Descrição", type: "text", required: true, colSpan: 2 },
  { name: "amount", label: "Valor (R$)", type: "number", required: true },
  { name: "dueDate", label: "Vencimento", type: "date", required: true },
  { name: "paymentDate", label: "Data de Pagamento", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(financeEntryStatusLabels),
  },
  {
    name: "paymentMethod",
    label: "Forma de Pagamento",
    type: "select",
    options: toOptions(paymentMethodLabels),
  },
  { name: "supplierId", label: "Fornecedor", type: "relation" },
  { name: "costCenterId", label: "Centro de Custo", type: "relation" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
