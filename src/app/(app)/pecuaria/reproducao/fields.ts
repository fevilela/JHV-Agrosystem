import type { RecordField } from "@/components/crud/record-form";
import { toOptions, reproductionMethodLabels, diagnosisResultLabels } from "@/lib/labels";

export const reproductionFields: RecordField[] = [
  { name: "animalId", label: "Animal (Fêmea)", type: "relation", required: true },
  {
    name: "method",
    label: "Método",
    type: "select",
    required: true,
    options: toOptions(reproductionMethodLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "diagnosisDate", label: "Data do Diagnóstico", type: "date" },
  {
    name: "diagnosisResult",
    label: "Resultado do Diagnóstico",
    type: "select",
    options: toOptions(diagnosisResultLabels),
  },
  { name: "expectedBirthDate", label: "Previsão de Parto", type: "date" },
  { name: "birthDate", label: "Data de Parição", type: "date" },
  { name: "weaningDate", label: "Data de Desmama", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
