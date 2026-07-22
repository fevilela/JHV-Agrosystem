import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getQuotationFields } from "../fields";
import { createQuotationAction } from "../actions";

export default async function NewQuotationPage() {
  const [suppliers, requests] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.purchaseRequest.findMany({ orderBy: { date: "desc" } }),
  ]);
  const t = await getTranslations("compras.cotacoes");
  const tStatus = await getTranslations("labels.quotationStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getQuotationFields(t, tStatus)}
        action={createQuotationAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          purchaseRequestId: requests.map((r) => ({ id: r.id, label: r.description })),
        }}
        backHref="/compras/cotacoes"
      />
    </div>
  );
}
