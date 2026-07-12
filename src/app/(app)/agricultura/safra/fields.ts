import type { RecordField } from "@/components/crud/record-form";
import { toOptions, safraStatusLabels } from "@/lib/labels";

export const safraFields: RecordField[] = [
  { name: "talhaoId", label: "Talhão", type: "relation", required: true },
  { name: "name", label: "Nome da Safra", type: "text", required: true },
  { name: "cultura", label: "Cultura", type: "text", required: true },
  { name: "variedade", label: "Variedade", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(safraStatusLabels),
  },
  { name: "dataInicio", label: "Data de Início", type: "date" },
  { name: "dataFimPrevista", label: "Previsão de Encerramento", type: "date" },
  { name: "custoPrevisto", label: "Custo Previsto (R$)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
