import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { purchaseRequestFields } from "../fields";
import { updatePurchaseRequestAction } from "../actions";

export default async function EditPurchaseRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [request, stockItems] = await Promise.all([
    prisma.purchaseRequest.findUnique({ where: { id } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!request) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Solicitação</h1>
      <RecordForm
        fields={purchaseRequestFields}
        action={updatePurchaseRequestAction.bind(null, id)}
        initialValues={request}
        relationOptions={{
          stockItemId: stockItems.map((i) => ({ id: i.id, label: `${i.code} — ${i.name}` })),
        }}
        backHref="/compras/solicitacoes"
      />
    </div>
  );
}
