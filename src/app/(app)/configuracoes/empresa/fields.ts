import type { RecordField } from "@/components/crud/record-form";

export function getCompanyProfileFields(t: (key: string) => string): RecordField[] {
  return [
    { name: "name", label: t("fields.name"), type: "text", required: true, colSpan: 2 },
    { name: "cpfCnpj", label: t("fields.cpfCnpj"), type: "text" },
    { name: "phone", label: t("fields.phone"), type: "text" },
    { name: "email", label: t("fields.email"), type: "text" },
    { name: "zipCode", label: t("fields.zipCode"), type: "text" },
    { name: "address", label: t("fields.address"), type: "text" },
    { name: "streetNumber", label: t("fields.streetNumber"), type: "text" },
    { name: "neighborhood", label: t("fields.neighborhood"), type: "text" },
    { name: "city", label: t("fields.city"), type: "text" },
    { name: "state", label: t("fields.state"), type: "text" },
  ];
}
