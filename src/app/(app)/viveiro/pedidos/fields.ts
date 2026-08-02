import type { RecordField } from "@/components/crud/record-form";

export const mudaPedidoVendaFields: RecordField[] = [
  { name: "numero", label: "Nº do Pedido", type: "text", required: true },
  { name: "clienteId", label: "Cliente", type: "relation", required: true },
  { name: "dataPedido", label: "Data do Pedido", type: "date", required: true },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
