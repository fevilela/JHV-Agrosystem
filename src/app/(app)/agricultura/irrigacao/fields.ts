import type { RecordField } from "@/components/crud/record-form";

export const irrigationFields: RecordField[] = [
  { name: "talhaoId", label: "Talhão", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "consumoM3", label: "Consumo (m³)", type: "number" },
  { name: "horasBomba", label: "Horas de Bomba", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
