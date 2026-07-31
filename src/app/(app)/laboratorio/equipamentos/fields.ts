import type { RecordField } from "@/components/crud/record-form";
import { toOptions, equipamentoStatusLabels } from "@/lib/labels";

export const equipamentoFields: RecordField[] = [
  { name: "nome", label: "Nome/Modelo do Equipamento", type: "text", required: true, colSpan: 2 },
  { name: "modelo", label: "Modelo", type: "text" },
  { name: "numeroSerie", label: "Nº de Série/Patrimônio", type: "text" },
  { name: "dataUltimaCalibracao", label: "Data da Última Calibração", type: "date" },
  { name: "dataProximaCalibracao", label: "Data da Próxima Calibração", type: "date" },
  { name: "responsavelCalibracao", label: "Responsável pela Calibração", type: "text" },
  { name: "certificadoCalibracaoUrl", label: "Certificado de Calibração (link/URL)", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(equipamentoStatusLabels),
  },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
