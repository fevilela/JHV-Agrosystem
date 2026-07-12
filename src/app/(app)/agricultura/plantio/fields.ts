import type { RecordField } from "@/components/crud/record-form";

export const plantioFields: RecordField[] = [
  { name: "safraId", label: "Safra", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "sementes", label: "Sementes", type: "text" },
  { name: "populacaoPlantasHa", label: "População (plantas/ha)", type: "number" },
  { name: "maquina", label: "Máquina", type: "text" },
  { name: "operador", label: "Operador", type: "text" },
  { name: "tempoHoras", label: "Tempo (horas)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
