import type { RecordField } from "@/components/crud/record-form";
import { toOptions, attendanceStatusLabels } from "@/lib/labels";

export const attendanceFields: RecordField[] = [
  { name: "employeeId", label: "Funcionário", type: "relation", required: true },
  { name: "date", label: "Data", type: "date", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(attendanceStatusLabels),
  },
  { name: "hoursWorked", label: "Horas Trabalhadas", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
