import type { RecordField } from "@/components/crud/record-form";

export const mechanicFields: RecordField[] = [
  { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
  { name: "cpf", label: "CPF", type: "text" },
  { name: "phone", label: "Telefone", type: "text" },
  { name: "specialty", label: "Especialidade", type: "text" },
  { name: "active", label: "Ativo", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
