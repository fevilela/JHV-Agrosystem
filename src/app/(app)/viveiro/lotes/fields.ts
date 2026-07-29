import type { RecordField } from "@/components/crud/record-form";
import { toOptions, origemPropaguloLabels, mudaLoteStatusLabels } from "@/lib/labels";

export const mudaLoteCreateFields: RecordField[] = [
  { name: "code", label: "Código do Lote", type: "text", required: true },
  { name: "especieId", label: "Espécie", type: "relation", required: true },
  { name: "viveiroId", label: "Viveiro", type: "relation", required: true },
  {
    name: "dataSemeaduraEstaqueamento",
    label: "Data de Semeadura/Estaqueamento",
    type: "date",
    required: true,
  },
  {
    name: "origemPropagulo",
    label: "Origem do Propágulo",
    type: "select",
    required: true,
    options: toOptions(origemPropaguloLabels),
  },
  { name: "numeroNotaCertificado", label: "Nº Nota/Certificado", type: "text" },
  { name: "quantidadeInicial", label: "Quantidade Inicial", type: "number", required: true },
  { name: "responsavelId", label: "Responsável Técnico", type: "relation" },
  { name: "substrato", label: "Substrato", type: "text" },
  { name: "recipiente", label: "Recipiente (tipo + tamanho)", type: "text" },
  { name: "previsaoConclusao", label: "Previsão de Conclusão", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];

export const mudaLoteEditFields: RecordField[] = [
  { name: "viveiroId", label: "Viveiro", type: "relation", required: true },
  { name: "responsavelId", label: "Responsável Técnico", type: "relation" },
  { name: "numeroNotaCertificado", label: "Nº Nota/Certificado", type: "text" },
  { name: "substrato", label: "Substrato", type: "text" },
  { name: "recipiente", label: "Recipiente (tipo + tamanho)", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(mudaLoteStatusLabels),
  },
  { name: "previsaoConclusao", label: "Previsão de Conclusão", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
