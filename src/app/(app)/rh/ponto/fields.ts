import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, attendanceStatusLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getAttendanceFields(t: Translator, tStatus: Translator): RecordField[] {
  return [
    { name: "employeeId", label: t("employeeId"), type: "relation", required: true },
    { name: "date", label: t("date"), type: "date", required: true },
    {
      name: "status",
      label: t("status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(attendanceStatusLabels, tStatus),
    },
    { name: "hoursWorked", label: t("hoursWorked"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
