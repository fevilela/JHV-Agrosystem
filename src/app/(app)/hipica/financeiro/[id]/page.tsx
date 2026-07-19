import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { financialFields } from "../fields";
import { updateFinancialAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditFinancialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const [entry, animals, clients] = await Promise.all([
    prisma.financialEntry.findFirst({ where: { id, organizationId } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.client.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!entry) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Lançamento</h1>
      <RecordForm
        fields={financialFields}
        action={updateFinancialAction.bind(null, id)}
        initialValues={entry}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/hipica/financeiro"
      />
    </div>
  );
}
