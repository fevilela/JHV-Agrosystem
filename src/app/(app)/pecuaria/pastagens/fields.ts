import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, pastureRotationStatusLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getPastureFields(t: Translator, tStatus: Translator): RecordField[] {
  return [
    { name: "code", label: t("code"), type: "text", required: true },
    { name: "name", label: t("name"), type: "text" },
    { name: "areaHectares", label: t("areaHectares"), type: "number" },
    { name: "capacityHead", label: t("capacityHead"), type: "number" },
    {
      name: "rotationStatus",
      label: t("rotationStatus"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(pastureRotationStatusLabels, tStatus),
    },
    { name: "grassHeightCm", label: t("grassHeightCm"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
