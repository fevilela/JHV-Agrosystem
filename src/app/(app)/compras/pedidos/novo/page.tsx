import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { purchaseOrderFields } from "../fields";
import { createPurchaseOrderAction } from "../actions";

export default async function NewPurchaseOrderPage() {
  const [suppliers, quotations] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.quotation.findMany({ orderBy: { createdAt: "desc" }, include: { supplier: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Pedido</h1>
      <RecordForm
        fields={purchaseOrderFields}
        action={createPurchaseOrderAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          quotationId: quotations.map((q) => ({
            id: q.id,
            label: `${q.supplier.name} — ${q.description || "sem descrição"}`,
          })),
        }}
        backHref="/compras/pedidos"
      />
    </div>
  );
}
