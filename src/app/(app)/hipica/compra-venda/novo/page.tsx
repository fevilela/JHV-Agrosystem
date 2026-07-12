import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { transactionFields } from "../fields";
import { createTransactionAction } from "../actions";

export default async function NewTransactionPage() {
  const animals = await prisma.animal.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Transação</h1>
      <RecordForm
        fields={transactionFields}
        action={createTransactionAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/compra-venda"
      />
    </div>
  );
}
