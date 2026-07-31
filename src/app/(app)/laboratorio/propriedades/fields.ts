import type { RecordField } from "@/components/crud/record-form";

export const propriedadeFields: RecordField[] = [
  { name: "name", label: "Nome da Propriedade/Fazenda", type: "text", required: true, colSpan: 2 },
  { name: "produtorId", label: "Produtor", type: "relation", required: true },
  { name: "areaTotalHa", label: "Área Total (ha)", type: "number" },
  { name: "latitude", label: "Latitude", type: "number" },
  { name: "longitude", label: "Longitude", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];

export const talhaoFields: RecordField[] = [
  { name: "code", label: "Código/Nome do Talhão", type: "text", required: true },
  { name: "areaHa", label: "Área (ha)", type: "number" },
  { name: "culturaImplantada", label: "Cultura Implantada", type: "text" },
  { name: "tipoSolo", label: "Tipo de Solo", type: "text" },
  { name: "historicoUso", label: "Histórico de Uso (safras anteriores)", type: "textarea", colSpan: 2 },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
