import type { RecordField } from "@/components/crud/record-form";
import { toOptions, scheduleShiftLabels } from "@/lib/labels";

export const scheduleFields: RecordField[] = [
  { name: "employeeId", label: "Funcionário", type: "relation", required: true },
  {
    name: "shift",
    label: "Turno",
    type: "select",
    required: true,
    options: toOptions(scheduleShiftLabels),
  },
  { name: "startDate", label: "Início", type: "date", required: true },
  { name: "endDate", label: "Fim", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
