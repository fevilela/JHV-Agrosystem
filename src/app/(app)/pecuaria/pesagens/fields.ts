import type { RecordField } from "@/components/crud/record-form";

export const weightFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "weightKg", label: "Peso (kg)", type: "number", required: true },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
