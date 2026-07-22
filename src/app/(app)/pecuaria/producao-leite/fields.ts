import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, milkShiftLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getMilkFields(t: Translator, tShift: Translator): RecordField[] {
  return [
    { name: "animalId", label: t("animalId"), type: "relation", required: true },
    { name: "date", label: t("date"), type: "date", required: true },
    {
      name: "shift",
      label: t("shift"),
      type: "select",
      options: toOptionsFromKeys(milkShiftLabels, tShift),
    },
    { name: "liters", label: t("liters"), type: "number", required: true },
    { name: "ccs", label: t("ccs"), type: "number" },
    { name: "cbt", label: t("cbt"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
