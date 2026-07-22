import type { RecordField } from "@/components/crud/record-form";

export function getMechanicFields(t: (key: string) => string): RecordField[] {
  return [
    { name: "name", label: t("fields.name"), type: "text", required: true, colSpan: 2 },
    { name: "cpf", label: t("fields.cpf"), type: "text" },
    { name: "phone", label: t("fields.phone"), type: "text" },
    { name: "specialty", label: t("fields.specialty"), type: "text" },
    { name: "active", label: t("fields.active"), type: "checkbox" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
