import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, safraStatusLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getSafraFields(t: Translator, tStatus: Translator): RecordField[] {
  return [
    { name: "talhaoId", label: t("talhaoId"), type: "relation", required: true },
    { name: "name", label: t("name"), type: "text", required: true },
    { name: "cultura", label: t("cultura"), type: "text", required: true },
    { name: "variedade", label: t("variedade"), type: "text" },
    {
      name: "status",
      label: t("status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(safraStatusLabels, tStatus),
    },
    { name: "dataInicio", label: t("dataInicio"), type: "date" },
    { name: "dataFimPrevista", label: t("dataFimPrevista"), type: "date" },
    { name: "custoPrevisto", label: t("custoPrevisto"), type: "number" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
