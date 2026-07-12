import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { quotationFields } from "../fields";
import { updateQuotationAction } from "../actions";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quotation, suppliers, requests] = await Promise.all([
    prisma.quotation.findUnique({ where: { id } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.purchaseRequest.findMany({ orderBy: { date: "desc" } }),
  ]);

  if (!quotation) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Cotação</h1>
      <RecordForm
        fields={quotationFields}
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
