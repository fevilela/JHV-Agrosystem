import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, financeEntryStatusLabels, paymentMethodLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getPayableFields(
  t: Translator,
  tStatus: Translator,
  tPaymentMethod: Translator
): RecordField[] {
  return [
    { name: "description", label: t("description"), type: "text", required: true, colSpan: 2 },
    { name: "amount", label: t("amount"), type: "number", required: true },
    { name: "dueDate", label: t("dueDate"), type: "date", required: true },
    { name: "paymentDate", label: t("paymentDate"), type: "date" },
    {
      name: "status",
      label: t("status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(financeEntryStatusLabels, tStatus),
    },
    {
      name: "paymentMethod",
      label: t("paymentMethod"),
      type: "select",
      options: toOptionsFromKeys(paymentMethodLabels, tPaymentMethod),
    },
    { name: "supplierId", label: t("supplierId"), type: "relation" },
    { name: "costCenterId", label: t("costCenterId"), type: "relation" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
