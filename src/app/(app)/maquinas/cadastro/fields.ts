import type { RecordField } from "@/components/crud/record-form";
import { toOptions, machineTypeLabels, machineStatusLabels } from "@/lib/labels";

export const machineFields: RecordField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    options: toOptions(machineTypeLabels),
  },
  { name: "brand", label: "Marca", type: "text" },
  { name: "model", label: "Modelo", type: "text" },
  { name: "plateOrSerial", label: "Placa/Nº de Série", type: "text" },
  { name: "year", label: "Ano", type: "number" },
  { name: "acquisitionDate", label: "Data de Aquisição", type: "date" },
  { name: "horimetroAtual", label: "Horímetro Atual (h)", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(machineStatusLabels),
  },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
