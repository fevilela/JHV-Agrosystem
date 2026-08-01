import type { RecordField } from "@/components/crud/record-form";
import {
  toOptions,
  naoConformidadeOrigemLabels,
  naoConformidadeSeveridadeLabels,
  naoConformidadeStatusLabels,
} from "@/lib/labels";

export const naoConformidadeFields: RecordField[] = [
  {
    name: "origem",
    label: "Origem",
    type: "select",
    required: true,
    options: toOptions(naoConformidadeOrigemLabels),
  },
  { name: "auditoriaId", label: "Auditoria Vinculada (se origem = Auditoria)", type: "relation" },
  { name: "resultadoId", label: "Resultado Vinculado (se origem = Análise Laboratorial)", type: "relation" },
  { name: "descricao", label: "Descrição", type: "textarea", required: true, colSpan: 2 },
  {
    name: "severidade",
    label: "Severidade",
    type: "select",
    required: true,
    options: toOptions(naoConformidadeSeveridadeLabels),
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(naoConformidadeStatusLabels),
  },
  { name: "responsavelInvestigacaoNome", label: "Responsável pela Investigação", type: "text" },
  { name: "prazoResolucao", label: "Prazo de Resolução", type: "date" },
  { name: "reincidente", label: "Reincidente", type: "checkbox" },
  { name: "causaRaiz", label: "Causa Raiz", type: "textarea", colSpan: 2 },
  { name: "acaoCorretivaPreventiva", label: "Ação Corretiva/Preventiva", type: "textarea", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
