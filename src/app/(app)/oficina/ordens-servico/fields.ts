import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, serviceOrderStatusLabels } from "@/lib/labels";

export function getServiceOrderFields(
  t: (key: string) => string,
  tStatus: (key: string) => string
): RecordField[] {
  return [
    { name: "machineId", label: t("fields.machineId"), type: "relation", required: true },
    { name: "mechanicId", label: t("fields.mechanicId"), type: "relation" },
    {
      name: "description",
      label: t("fields.description"),
      type: "text",
      required: true,
      colSpan: 2,
    },
    { name: "openDate", label: t("fields.openDate"), type: "date", required: true },
    { name: "closeDate", label: t("fields.closeDate"), type: "date" },
    {
      name: "status",
      label: t("fields.status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(serviceOrderStatusLabels, tStatus),
    },
    { name: "laborCost", label: t("fields.laborCost"), type: "number" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
