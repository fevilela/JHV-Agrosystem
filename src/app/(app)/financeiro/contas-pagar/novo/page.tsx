import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { payableFields } from "../fields";
import { createPayableAction } from "../actions";

export default async function NewPayablePage() {
  const [suppliers, costCenters] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Conta a Pagar</h1>
      <RecordForm
        fields={payableFields}
        action={createPayableAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          costCenterId: costCenters.map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
        }}
        backHref="/financeiro/contas-pagar"
      />
    </div>
  );
}
