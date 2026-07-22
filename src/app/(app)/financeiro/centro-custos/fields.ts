import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getCostCenterFields(t: Translator): RecordField[] {
  return [
    { name: "code", label: t("code"), type: "text", required: true },
    { name: "name", label: t("name"), type: "text", required: true },
    { name: "description", label: t("description"), type: "text", colSpan: 2 },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
