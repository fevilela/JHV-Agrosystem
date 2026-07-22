import type { RecordField } from "@/components/crud/record-form";

export function getUsageLogFields(t: (key: string) => string): RecordField[] {
  return [
    { name: "machineId", label: t("fields.machineId"), type: "relation", required: true },
    { name: "date", label: t("fields.date"), type: "date", required: true },
    { name: "horimetro", label: t("fields.horimetro"), type: "number", required: true },
    { name: "combustivelLitros", label: t("fields.combustivelLitros"), type: "number" },
    { name: "operador", label: t("fields.operador"), type: "text" },
    { name: "talhaoId", label: t("fields.talhaoId"), type: "relation" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
