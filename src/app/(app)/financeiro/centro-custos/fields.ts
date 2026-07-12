import type { RecordField } from "@/components/crud/record-form";

export const costCenterFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "description", label: "Descrição", type: "text", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
