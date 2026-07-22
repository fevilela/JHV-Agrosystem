import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getQuotationFields } from "../fields";
import { updateQuotationAction } from "../actions";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [quotation, suppliers, requests] = await Promise.all([
    prisma.quotation.findFirst({ where: { id, organizationId } }),
    prisma.supplier.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.purchaseRequest.findMany({ where: { organizationId }, orderBy: { date: "desc" } }),
  ]);

  if (!quotation) notFound();

  const t = await getTranslations("compras.cotacoes");
  const tStatus = await getTranslations("labels.quotationStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getQuotationFields(t, tStatus)}
        action={updateQuotationAction.bind(null, id)}
        initialValues={quotation}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          purchaseRequestId: requests.map((r) => ({ id: r.id, label: r.description })),
        }}
        backHref="/compras/cotacoes"
      />
    </div>
  );
}
