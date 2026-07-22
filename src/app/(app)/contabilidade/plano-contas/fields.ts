import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, chartAccountTypeLabels, chartAccountNatureLabels } from "@/lib/labels";

export function getChartAccountFields(
  t: (key: string) => string,
  tType: (key: string) => string,
  tNature: (key: string) => string
): RecordField[] {
  return [
    { name: "code", label: t("fields.code"), type: "text", required: true },
    { name: "name", label: t("fields.name"), type: "text", required: true, colSpan: 2 },
    {
      name: "type",
      label: t("fields.type"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(chartAccountTypeLabels, tType),
    },
    {
      name: "nature",
      label: t("fields.nature"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(chartAccountNatureLabels, tNature),
    },
    { name: "parentId", label: t("fields.parentId"), type: "relation" },
    { name: "analytic", label: t("fields.analytic"), type: "checkbox" },
    { name: "active", label: t("fields.active"), type: "checkbox" },
    { name: "notes", label: t("fields.notes"), type: "textarea", colSpan: 2 },
  ];
}
