import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getRecurringBillingFields(t: Translator): RecordField[] {
  return [
    { name: "clientId", label: t("clientId"), type: "relation", required: true },
    { name: "description", label: t("description"), type: "text", required: true, colSpan: 2 },
    { name: "amount", label: t("amount"), type: "number", required: true },
    {
      name: "dayOfMonth",
      label: t("dayOfMonth"),
      type: "number",
      required: true,
    },
    {
      name: "dueDay",
      label: t("dueDay"),
      type: "number",
    },
    { name: "active", label: t("active"), type: "checkbox" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
