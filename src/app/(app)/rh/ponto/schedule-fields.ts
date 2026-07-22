import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, scheduleShiftLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getScheduleFields(t: Translator, tShift: Translator): RecordField[] {
  return [
    { name: "employeeId", label: t("employeeId"), type: "relation", required: true },
    {
      name: "shift",
      label: t("shift"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(scheduleShiftLabels, tShift),
    },
    { name: "startDate", label: t("startDate"), type: "date", required: true },
    { name: "endDate", label: t("endDate"), type: "date" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
