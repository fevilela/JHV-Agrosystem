import type { RecordField } from "@/components/crud/record-form";
import { toOptions, equineHealthRecordTypeLabels } from "@/lib/labels";

export const equineHealthRecordFields: RecordField[] = [
  { name: "animalId", label: "Animal", type: "relation", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(equineHealthRecordTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "product", label: "Produto Aplicado", type: "text" },
  { name: "nextDoseDate", label: "Próxima Dose", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
