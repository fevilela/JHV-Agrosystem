import type { RecordField } from "@/components/crud/record-form";

export const talhaoFields: RecordField[] = [
  { name: "code", label: "Código", type: "text", required: true },
  { name: "name", label: "Nome", type: "text" },
  { name: "areaHectares", label: "Área (ha)", type: "number" },
  { name: "soilType", label: "Tipo de Solo", type: "text" },
  { name: "coordinates", label: "Coordenadas", type: "text", colSpan: 2 },
  { name: "notes", label: "Observações / Histórico", type: "textarea", colSpan: 2 },
];
