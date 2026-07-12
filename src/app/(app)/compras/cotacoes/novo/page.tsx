import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { quotationFields } from "../fields";
import { createQuotationAction } from "../actions";

export default async function NewQuotationPage() {
  const [suppliers, requests] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.purchaseRequest.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Cotação</h1>
      <RecordForm
        fields={quotationFields}
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
