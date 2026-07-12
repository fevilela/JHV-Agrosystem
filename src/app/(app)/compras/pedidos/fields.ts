import type { RecordField } from "@/components/crud/record-form";
import { toOptions, purchaseOrderStatusLabels } from "@/lib/labels";

export const purchaseOrderFields: RecordField[] = [
  { name: "supplierId", label: "Fornecedor", type: "relation", required: true },
  { name: "quotationId", label: "Cotação (opcional)", type: "relation" },
  { name: "orderDate", label: "Data do Pedido", type: "date", required: true },
  { name: "expectedDeliveryDate", label: "Entrega Prevista", type: "date" },
  { name: "actualDeliveryDate", label: "Entrega Realizada", type: "date" },
  { name: "invoiceNumber", label: "Nota Fiscal", type: "text" },
  { name: "totalValue", label: "Valor Total (R$)", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(purchaseOrderStatusLabels),
  },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
