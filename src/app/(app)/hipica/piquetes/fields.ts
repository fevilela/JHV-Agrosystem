import type { RecordField } from "@/components/crud/record-form";

export const piqueteFields: RecordField[] = [
  { name: "code", label: "Código/Número", type: "text", required: true },
  { name: "location", label: "Localização", type: "text" },
  { name: "propertyId", label: "Propriedade", type: "relation" },
  { name: "capacity", label: "Capacidade", type: "number" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
