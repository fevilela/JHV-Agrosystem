import type { RecordField } from "@/components/crud/record-form";

export const acreditacaoFields: RecordField[] = [
  { name: "escopoAcreditacao", label: "Escopo de Acreditação (ex: ISO/IEC 17025)", type: "text", colSpan: 2 },
  { name: "orgaoAcreditador", label: "Órgão Acreditador (ex: INMETRO/CGCRE)", type: "text" },
  { name: "dataValidade", label: "Data de Validade", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
