import type { RecordField } from "@/components/crud/record-form";

export const trainingFields: RecordField[] = [
  { name: "employeeId", label: "Funcionário", type: "relation", required: true },
  { name: "name", label: "Treinamento", type: "text", required: true, colSpan: 2 },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "provider", label: "Instituição/Fornecedor", type: "text" },
  { name: "validUntil", label: "Válido até", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
