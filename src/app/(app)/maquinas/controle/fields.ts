import type { RecordField } from "@/components/crud/record-form";

export const usageLogFields: RecordField[] = [
  { name: "machineId", label: "Máquina", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "horimetro", label: "Horímetro (h)", type: "number", required: true },
  { name: "combustivelLitros", label: "Combustível (L)", type: "number" },
  { name: "operador", label: "Operador", type: "text" },
  { name: "talhaoId", label: "Talhão", type: "relation" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
