import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { recurringBillingFields } from "../fields";
import { createRecurringBillingAction } from "../actions";

export default async function NewRecurringBillingPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Cobrança Recorrente</h1>
      <RecordForm
        fields={recurringBillingFields}
        action={createRecurringBillingAction}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/financeiro/recorrentes"
      />
    </div>
  );
}
