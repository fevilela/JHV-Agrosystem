import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, maintenanceTypeLabels } from "@/lib/labels";

export function getMaintenanceFields(
  t: (key: string) => string,
  tType: (key: string) => string
): RecordField[] {
  return [
    { name: "machineId", label: t("fields.machineId"), type: "relation", required: true },
    {
      name: "type",
      label: t("fields.type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(maintenanceTypeLabels, tType),
    },
    { name: "date", label: t("fields.date"), type: "date", required: true },
    { name: "description", label: t("fields.description"), type: "text", colSpan: 2 },
    { name: "cost", label: t("fields.cost"), type: "number" },
    { name: "horimetro", label: t("fields.horimetro"), type: "number" },
    { name: "nextDueDate", label: t("fields.nextDueDate"), type: "date" },
    { name: "nextDueHorimetro", label: t("fields.nextDueHorimetro"), type: "number" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
