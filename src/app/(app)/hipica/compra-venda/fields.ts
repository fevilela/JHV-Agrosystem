import type { RecordField } from "@/components/crud/record-form";
import { toOptions, animalTransactionTypeLabels } from "@/lib/labels";

export const transactionFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(animalTransactionTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "value", label: "Valor (R$)", type: "number", required: true },
  { name: "commission", label: "Comissão (R$)", type: "number" },
  { name: "counterpartyName", label: "Contraparte (comprador/vendedor)", type: "text", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
