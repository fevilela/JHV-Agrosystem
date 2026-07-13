import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { recurringBillingFields } from "../fields";
import { updateRecurringBillingAction } from "../actions";

export default async function EditRecurringBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [template, clients] = await Promise.all([
    prisma.recurringBilling.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!template) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Cobrança Recorrente</h1>
      <RecordForm
        fields={recurringBillingFields}
        action={updateRecurringBillingAction.bind(null, id)}
        initialValues={template}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/financeiro/recorrentes"
      />
    </div>
  );
}
