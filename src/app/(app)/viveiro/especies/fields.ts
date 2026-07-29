import type { RecordField } from "@/components/crud/record-form";
import { toOptions, propagacaoTipoLabels } from "@/lib/labels";

export const mudaEspecieFields: RecordField[] = [
  { name: "nomePopular", label: "Nome Popular", type: "text", required: true, colSpan: 2 },
  { name: "nomeCientifico", label: "Nome Científico", type: "text" },
  { name: "familiaBotanica", label: "Família Botânica", type: "text" },
  { name: "cultivar", label: "Cultivar/Variedade/Clone", type: "text" },
  {
    name: "tipoPropagacao",
    label: "Tipo de Propagação",
    type: "select",
    required: true,
    options: toOptions(propagacaoTipoLabels),
  },
  { name: "cicloMedioDias", label: "Ciclo Médio até Expedição (dias)", type: "number" },
  { name: "temperaturaIdeal", label: "Temperatura Ideal", type: "text" },
  { name: "umidadeIdeal", label: "Umidade Ideal", type: "text" },
  { name: "espacamentoRecomendado", label: "Espaçamento Recomendado", type: "text" },
  { name: "fornecedorId", label: "Fornecedor de Material Genético", type: "relation" },
  { name: "fichaTecnica", label: "Ficha Técnica / Observações Técnicas", type: "textarea", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
