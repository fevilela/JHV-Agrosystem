import type { RecordField } from "@/components/crud/record-form";
import { toOptions, coberturaTipoLabels } from "@/lib/labels";

export const viveiroFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "propertyId", label: "Propriedade", type: "relation" },
  { name: "areaM2", label: "Área (m²)", type: "number" },
  {
    name: "tipoCobertura",
    label: "Tipo de Cobertura",
    type: "select",
    required: true,
    options: toOptions(coberturaTipoLabels),
  },
  { name: "percentualSombrite", label: "Percentual de Sombrite (%)", type: "number" },
  { name: "sistemaIrrigacao", label: "Sistema de Irrigação", type: "text" },
  { name: "capacidadeMaxima", label: "Capacidade Máxima (bandejas/tubetes)", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
