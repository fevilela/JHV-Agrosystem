import type { RecordField } from "@/components/crud/record-form";

export const pedidoAnaliseFields: RecordField[] = [
  { name: "numero", label: "Nº do Pedido", type: "text", required: true },
  { name: "produtorId", label: "Produtor", type: "relation", required: true },
  { name: "formaPagamento", label: "Forma de Pagamento", type: "text" },
  { name: "notaFiscalUrl", label: "Nota Fiscal (link/URL)", type: "text" },
];
