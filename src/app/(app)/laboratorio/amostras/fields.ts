import type { RecordField } from "@/components/crud/record-form";
import { toOptions, amostraTipoLabels, condicaoRecebimentoLabels } from "@/lib/labels";

export const amostraFields: RecordField[] = [
  { name: "code", label: "Código da Amostra", type: "text", required: true },
  {
    name: "tipo",
    label: "Tipo de Amostra",
    type: "select",
    required: true,
    options: toOptions(amostraTipoLabels),
  },
  { name: "propriedadeProdutorId", label: "Propriedade", type: "relation", required: true },
  { name: "talhaoProdutorId", label: "Talhão (opcional)", type: "relation" },
  { name: "dataColeta", label: "Data da Coleta", type: "date", required: true },
  { name: "profundidadeColeta", label: "Profundidade de Coleta (para solo)", type: "text" },
  { name: "responsavelColetaNome", label: "Responsável pela Coleta", type: "text" },
  { name: "metodoColeta", label: "Método de Coleta (protocolo)", type: "text" },
  { name: "dataRecebimento", label: "Data de Recebimento no Laboratório", type: "date" },
  {
    name: "condicaoRecebimento",
    label: "Condição de Recebimento",
    type: "select",
    options: toOptions(condicaoRecebimentoLabels),
  },
  { name: "numeroSubAmostras", label: "Nº de Sub-amostras/Pontos Compostos", type: "number" },
  { name: "prazoEntregaPrevisto", label: "Prazo de Entrega Previsto", type: "date" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
