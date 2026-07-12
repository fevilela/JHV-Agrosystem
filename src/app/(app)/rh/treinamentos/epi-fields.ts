import type { RecordField } from "@/components/crud/record-form";

export const epiFields: RecordField[] = [
  { name: "employeeId", label: "Funcionário", type: "relation", required: true },
  { name: "itemName", label: "EPI (capacete, luvas, botas...)", type: "text", required: true, colSpan: 2 },
  { name: "issueDate", label: "Data de Entrega", type: "date", required: true },
  { name: "validUntil", label: "Válido até", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
