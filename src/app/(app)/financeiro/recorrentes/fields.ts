import type { RecordField } from "@/components/crud/record-form";

export const recurringBillingFields: RecordField[] = [
  { name: "clientId", label: "Cliente", type: "relation", required: true },
  { name: "description", label: "Descrição", type: "text", required: true, colSpan: 2 },
  { name: "amount", label: "Valor (R$)", type: "number", required: true },
  {
    name: "dayOfMonth",
    label: "Dia do mês (1 a 28)",
    type: "number",
    required: true,
  },
  { name: "active", label: "Ativo", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
