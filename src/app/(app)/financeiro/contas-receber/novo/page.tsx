import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { receivableFields } from "../fields";
import { createReceivableAction } from "../actions";

export default async function NewReceivablePage() {
  const [clients, costCenters] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Conta a Receber</h1>
      <RecordForm
        fields={receivableFields}
        action={createReceivableAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
          costCenterId: costCenters.map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
        }}
        backHref="/financeiro/contas-receber"
      />
    </div>
  );
}
