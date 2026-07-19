import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { transactionFields } from "../fields";
import { updateTransactionAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const [transaction, animals] = await Promise.all([
    prisma.animalTransaction.findFirst({ where: { id, organizationId } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
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
