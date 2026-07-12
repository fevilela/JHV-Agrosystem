import type { RecordField } from "@/components/crud/record-form";
import {
  toOptions,
  animalSexoLabels,
  livestockCategoryLabels,
  livestockStatusLabels,
} from "@/lib/labels";

export const livestockAnimalFields: RecordField[] = [
  { name: "brinco", label: "Brinco", type: "text", required: true },
  { name: "rfid", label: "RFID", type: "text" },
  { name: "name", label: "Nome", type: "text" },
  {
    name: "sexo",
    label: "Sexo",
    type: "select",
    options: toOptions(animalSexoLabels),
  },
  { name: "raca", label: "Raça", type: "text" },
  {
    name: "category",
    label: "Categoria",
    type: "select",
    required: true,
    options: toOptions(livestockCategoryLabels),
  },
  { name: "dataNascimento", label: "Data de Nascimento", type: "date" },
  { name: "pesoAtual", label: "Peso Atual (kg)", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(livestockStatusLabels),
  },
  { name: "loteId", label: "Lote", type: "relation" },
  { name: "pastureId", label: "Pasto", type: "relation" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
