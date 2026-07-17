import type { RecordField } from "@/components/crud/record-form";
import { toOptions, chartAccountTypeLabels, chartAccountNatureLabels } from "@/lib/labels";

export const chartAccountFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(chartAccountTypeLabels),
  },
  {
    name: "nature",
    label: "Natureza",
    type: "select",
    required: true,
    options: toOptions(chartAccountNatureLabels),
  },
  { name: "parentId", label: "Conta Pai", type: "relation" },
  { name: "analytic", label: "Analítica (aceita lançamento)", type: "checkbox" },
  { name: "active", label: "Ativa", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
