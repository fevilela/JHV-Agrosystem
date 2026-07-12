import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { receivableFields } from "../fields";
import { updateReceivableAction } from "../actions";

export default async function EditReceivablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [entry, clients, costCenters] = await Promise.all([
    prisma.financeEntry.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!entry || entry.type !== "RECEBER") notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Conta a Receber</h1>
      <RecordForm
        fields={receivableFields}
        action={updateReceivableAction.bind(null, id)}
        initialValues={entry}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
          costCenterId: costCenters.map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
        }}
        backHref="/financeiro/contas-receber"
      />
    </div>
  );
}
