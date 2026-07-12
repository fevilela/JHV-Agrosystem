import type { RecordField } from "@/components/crud/record-form";
import { toOptions, quotationStatusLabels } from "@/lib/labels";

export const quotationFields: RecordField[] = [
  { name: "supplierId", label: "Fornecedor", type: "relation", required: true },
  { name: "purchaseRequestId", label: "Solicitação (opcional)", type: "relation" },
  { name: "description", label: "Descrição", type: "text", colSpan: 2 },
  { name: "quantity", label: "Quantidade", type: "number" },
  { name: "unitPrice", label: "Preço Unitário (R$)", type: "number" },
  { name: "totalValue", label: "Valor Total (R$)", type: "number" },
  { name: "validUntil", label: "Válida até", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: toOptions(quotationStatusLabels),
  },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];
