import type { RecordField } from "@/components/crud/record-form";

export const competitionFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  { name: "name", label: "Nome da Competição", type: "text", required: true, colSpan: 2 },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "location", label: "Local", type: "text" },
  { name: "category", label: "Categoria", type: "text" },
  { name: "result", label: "Resultado", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
