import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getTrainingFields(t: Translator): RecordField[] {
  return [
    { name: "employeeId", label: t("employeeId"), type: "relation", required: true },
    { name: "name", label: t("name"), type: "text", required: true, colSpan: 2 },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "provider", label: t("provider"), type: "text" },
    { name: "validUntil", label: t("validUntil"), type: "date" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
