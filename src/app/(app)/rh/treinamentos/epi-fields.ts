import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getEpiFields(t: Translator): RecordField[] {
  return [
    { name: "employeeId", label: t("employeeId"), type: "relation", required: true },
    { name: "itemName", label: t("itemName"), type: "text", required: true, colSpan: 2 },
    { name: "issueDate", label: t("issueDate"), type: "date", required: true },
    { name: "validUntil", label: t("validUntil"), type: "date" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
