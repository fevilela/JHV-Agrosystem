import type { RecordField } from "@/components/crud/record-form";
import { toOptions, produtorTipoLabels } from "@/lib/labels";

export const produtorFields: RecordField[] = [
  { name: "name", label: "Nome / Razão Social", type: "text", required: true, colSpan: 2 },
  { name: "cpfCnpj", label: "CPF/CNPJ", type: "text" },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(produtorTipoLabels),
  },
  { name: "inscricaoEstadual", label: "Inscrição Estadual", type: "text" },
  { name: "numeroProdutorRural", label: "Nº Produtor Rural", type: "text" },
  { name: "phone", label: "Telefone", type: "text" },
  { name: "email", label: "E-mail", type: "text" },
  { name: "address", label: "Endereço", type: "text", colSpan: 2 },
  { name: "city", label: "Cidade", type: "text" },
  { name: "state", label: "Estado", type: "text" },
  { name: "responsavelTecnicoNome", label: "Responsável Técnico Vinculado (nome)", type: "text" },
  { name: "responsavelTecnicoCrea", label: "Responsável Técnico Vinculado (CREA)", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
