import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, machineTypeLabels, machineStatusLabels } from "@/lib/labels";

export function getMachineFields(
  t: (key: string) => string,
  tType: (key: string) => string,
  tStatus: (key: string) => string
): RecordField[] {
  return [
    {
      name: "type",
      label: t("fields.type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(machineTypeLabels, tType),
    },
    { name: "brand", label: t("fields.brand"), type: "text" },
    { name: "model", label: t("fields.model"), type: "text" },
    { name: "plateOrSerial", label: t("fields.plateOrSerial"), type: "text" },
    { name: "year", label: t("fields.year"), type: "number" },
    { name: "acquisitionDate", label: t("fields.acquisitionDate"), type: "date" },
    { name: "horimetroAtual", label: t("fields.horimetroAtual"), type: "number" },
    {
      name: "status",
      label: t("fields.status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(machineStatusLabels, tStatus),
    },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
