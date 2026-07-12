import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { purchaseOrderFields } from "../fields";
import { updatePurchaseOrderAction } from "../actions";

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, suppliers, quotations] = await Promise.all([
    prisma.purchaseOrder.findUnique({ where: { id } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.quotation.findMany({ orderBy: { createdAt: "desc" }, include: { supplier: true } }),
  ]);

  if (!order) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Pedido</h1>
      <RecordForm
        fields={purchaseOrderFields}
        action={updatePurchaseOrderAction.bind(null, id)}
        initialValues={order}
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
