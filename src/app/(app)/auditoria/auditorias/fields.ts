import type { RecordField } from "@/components/crud/record-form";
import { toOptions, auditoriaTipoLabels, auditoriaStatusLabels } from "@/lib/labels";

export const auditoriaFields: RecordField[] = [
  {
    name: "tipo",
    label: "Tipo de Auditoria",
    type: "select",
    required: true,
    options: toOptions(auditoriaTipoLabels),
  },
  { name: "propriedadeProdutorId", label: "Propriedade Auditada", type: "relation", required: true },
  { name: "dataAuditoria", label: "Data da Auditoria", type: "date", required: true },
  { name: "auditorNome", label: "Auditor Responsável (interno ou credenciado)", type: "text" },
  { name: "checklistNormaReferencia", label: "Checklist/Norma de Referência Utilizada", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(auditoriaStatusLabels),
  },
  { name: "dataReavaliacao", label: "Data de Reavaliação", type: "date" },
  { name: "certificadoGeradoUrl", label: "Certificado Gerado (link/URL)", type: "text" },
  { name: "certificadoValidade", label: "Validade do Certificado", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
