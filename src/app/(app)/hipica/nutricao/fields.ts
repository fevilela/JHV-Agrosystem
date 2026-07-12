import type { RecordField } from "@/components/crud/record-form";

export const dietFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  { name: "startDate", label: "Data de Início", type: "date", required: true },
  { name: "concentradoKg", label: "Concentrado (kg/dia)", type: "number" },
  { name: "fenoKg", label: "Feno (kg/dia)", type: "number" },
  { name: "silagemKg", label: "Silagem (kg/dia)", type: "number" },
  { name: "suplementos", label: "Suplementos", type: "text", colSpan: 2 },
  {
    name: "quantidadeDiariaKg",
    label: "Quantidade Diária Total (kg)",
    type: "number",
  },
  { name: "custoDiario", label: "Custo Diário (R$)", type: "number" },
  { name: "active", label: "Dieta ativa", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
