import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { financialFields } from "../fields";
import { createFinancialAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewFinancialPage() {
  const { organizationId } = await requireModule("hipica");
  const [animals, clients] = await Promise.all([
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.client.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Lançamento</h1>
      <RecordForm
        fields={financialFields}
        action={createFinancialAction}
        initialValues={{ status: "PENDENTE", type: "OUTRO" }}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/hipica/financeiro"
      />
    </div>
  );
}
