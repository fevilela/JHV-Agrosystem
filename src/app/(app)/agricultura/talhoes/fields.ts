import type { RecordField } from "@/components/crud/record-form";

type Translator = (key: string) => string;

export function getTalhaoFields(t: Translator): RecordField[] {
  return [
    { name: "code", label: t("code"), type: "text", required: true },
    { name: "name", label: t("name"), type: "text" },
    { name: "areaHectares", label: t("areaHectares"), type: "number" },
    { name: "soilType", label: t("soilType"), type: "text" },
    { name: "coordinates", label: t("coordinates"), type: "text", colSpan: 2 },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
