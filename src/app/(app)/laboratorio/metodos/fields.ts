import type { RecordField } from "@/components/crud/record-form";

export const metodoAnaliticoFields: RecordField[] = [
  { name: "nomeParametro", label: "Nome do Parâmetro", type: "text", required: true, colSpan: 2 },
  { name: "referenciaNormativa", label: "Referência Normativa (Embrapa, MAPA, EPA, ISO...)", type: "text" },
  { name: "unidadeMedida", label: "Unidade de Medida", type: "text" },
  { name: "faixaDeteccaoMin", label: "Faixa de Detecção — Mínimo", type: "number" },
  { name: "faixaDeteccaoMax", label: "Faixa de Detecção — Máximo", type: "number" },
  { name: "incertezaMedicao", label: "Incerteza de Medição", type: "number" },
  { name: "tempoMedioAnaliseDias", label: "Tempo Médio de Análise (dias)", type: "number" },
  { name: "active", label: "Ativo", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
