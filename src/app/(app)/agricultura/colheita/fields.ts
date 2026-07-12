import type { RecordField } from "@/components/crud/record-form";

export const harvestFields: RecordField[] = [
  { name: "safraId", label: "Safra", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "producaoKg", label: "Produção (kg)", type: "number" },
  { name: "umidade", label: "Umidade (%)", type: "number" },
  { name: "qualidade", label: "Qualidade", type: "text" },
  { name: "maquina", label: "Máquina", type: "text" },
  { name: "operador", label: "Operador", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
