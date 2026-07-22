import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getPayableFields } from "../fields";
import { createPayableAction } from "../actions";

export default async function NewPayablePage() {
  const [suppliers, costCenters] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ orderBy: { name: "asc" } }),
  ]);

  const t = await getTranslations("financeiro.contasPagar");
  const tf = await getTranslations("financeiro.contasPagar.fields");
  const tStatus = await getTranslations("labels.financeEntryStatus");
  const tPaymentMethod = await getTranslations("labels.paymentMethod");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getPayableFields(tf, tStatus, tPaymentMethod)}
        action={createPayableAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          costCenterId: costCenters.map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
        }}
        backHref="/financeiro/contas-pagar"
      />
    </div>
  );
}
