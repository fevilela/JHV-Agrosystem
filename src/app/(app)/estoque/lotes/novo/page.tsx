import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { stockBatchFields } from "../fields";
import { createStockBatchAction } from "../actions";

export default async function NewStockBatchPage() {
  const items = await prisma.stockItem.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Lote</h1>
      <RecordForm
        fields={stockBatchFields}
        action={createStockBatchAction}
        relationOptions={{
          stockItemId: items.map((i) => ({ id: i.id, label: `${i.code} — ${i.name}` })),
        }}
        backHref="/estoque/lotes"
      />
    </div>
  );
}
