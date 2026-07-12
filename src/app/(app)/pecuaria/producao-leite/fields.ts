import type { RecordField } from "@/components/crud/record-form";
import { toOptions, milkShiftLabels } from "@/lib/labels";

export const milkFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  {
    name: "shift",
    label: "Turno",
    type: "select",
    options: toOptions(milkShiftLabels),
  },
  { name: "liters", label: "Litros", type: "number", required: true },
  { name: "ccs", label: "CCS (Contagem Células Somáticas)", type: "number" },
  { name: "cbt", label: "CBT (Contagem Bacteriana Total)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
