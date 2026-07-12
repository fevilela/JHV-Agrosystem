import type { RecordField } from "@/components/crud/record-form";
import { toOptions, exerciseTypeLabels, intensityLabels } from "@/lib/labels";

export const trainingFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  { name: "instructorId", label: "Instrutor", type: "relation" },
  { name: "date", label: "Data", type: "date", required: true },
  {
    name: "exerciseType",
    label: "Tipo de Exercício",
    type: "select",
    required: true,
    options: toOptions(exerciseTypeLabels),
  },
  { name: "durationMin", label: "Tempo (min)", type: "number" },
  {
    name: "intensity",
    label: "Intensidade",
    type: "select",
    options: toOptions(intensityLabels),
  },
  { name: "evolution", label: "Evolução", type: "textarea", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
