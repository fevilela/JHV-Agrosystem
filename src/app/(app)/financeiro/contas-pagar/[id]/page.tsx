import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { payableFields } from "../fields";
import { updatePayableAction } from "../actions";

export default async function EditPayablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [entry, suppliers, costCenters] = await Promise.all([
    prisma.financeEntry.findUnique({ where: { id } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!entry || entry.type !== "PAGAR") notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Conta a Pagar</h1>
      <RecordForm
        fields={payableFields}
        action={updatePayableAction.bind(null, id)}
        initialValues={entry}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          costCenterId: costCenters.map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
        }}
        backHref="/financeiro/contas-pagar"
      />
    </div>
  );
}
