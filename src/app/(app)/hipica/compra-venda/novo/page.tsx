import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { transactionFields } from "../fields";
import { createTransactionAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewTransactionPage() {
  const { organizationId } = await requireModule("hipica");
  const animals = await prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

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
