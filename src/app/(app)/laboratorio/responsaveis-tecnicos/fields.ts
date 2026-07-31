import type { RecordField } from "@/components/crud/record-form";
import { toOptions, registroProfissionalTipoLabels } from "@/lib/labels";

export const responsavelTecnicoCreateFields: RecordField[] = [
  { name: "employeeId", label: "Funcionário", type: "relation", required: true },
  { name: "registroProfissional", label: "Registro Profissional (nº)", type: "text", required: true },
  {
    name: "tipoRegistro",
    label: "Tipo de Registro",
    type: "select",
    required: true,
    options: toOptions(registroProfissionalTipoLabels),
  },
  { name: "setor", label: "Setor Vinculado", type: "text" },
  { name: "assinaturaDigitalRef", label: "Referência de Assinatura Digital (ICP-Brasil)", type: "text" },
  { name: "active", label: "Ativo", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];

export const responsavelTecnicoEditFields: RecordField[] = responsavelTecnicoCreateFields.filter(
  (f) => f.name !== "employeeId"
);
