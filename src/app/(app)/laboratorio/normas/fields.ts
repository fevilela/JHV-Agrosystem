import type { RecordField } from "@/components/crud/record-form";

export const normaReferenciaFields: RecordField[] = [
  { name: "nome", label: "Norma/Legislação (ex: IN MAPA, CONAMA, ISO, NBR)", type: "text", required: true, colSpan: 2 },
  { name: "metodoAnaliticoId", label: "Parâmetro Vinculado", type: "relation" },
  { name: "limiteLegal", label: "Limite Legal / Valor de Referência", type: "text" },
  { name: "dataVigencia", label: "Data de Vigência", type: "date" },
  { name: "versao", label: "Versão/Atualização da Norma", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
