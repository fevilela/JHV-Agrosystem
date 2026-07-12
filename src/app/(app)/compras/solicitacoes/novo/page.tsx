import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { purchaseRequestFields } from "../fields";
import { createPurchaseRequestAction } from "../actions";

export default async function NewPurchaseRequestPage() {
  const stockItems = await prisma.stockItem.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Solicitação</h1>
      <RecordForm
        fields={purchaseRequestFields}
        action={createPurchaseRequestAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          stockItemId: stockItems.map((i) => ({ id: i.id, label: `${i.code} — ${i.name}` })),
        }}
        backHref="/compras/solicitacoes"
      />
    </div>
  );
}
