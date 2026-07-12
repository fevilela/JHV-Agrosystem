import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { transactionFields } from "../fields";
import { updateTransactionAction } from "../actions";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [transaction, animals] = await Promise.all([
    prisma.animalTransaction.findUnique({ where: { id } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!transaction) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Transação</h1>
      <RecordForm
        fields={transactionFields}
        action={updateTransactionAction.bind(null, id)}
        initialValues={transaction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/compra-venda"
      />
    </div>
  );
}
