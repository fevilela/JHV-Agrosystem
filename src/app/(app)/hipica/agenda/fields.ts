import type { RecordField } from "@/components/crud/record-form";
import { toOptions, agendaEventTypeLabels, agendaEventStatusLabels } from "@/lib/labels";

export const agendaFields: RecordField[] = [
  { name: "title", label: "Título", type: "text", required: true, colSpan: 2 },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(agendaEventTypeLabels),
  },
  { name: "date", label: "Data", type: "date", required: true },
  { name: "animalId", label: "Animal", type: "relation" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(agendaEventStatusLabels),
  },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
