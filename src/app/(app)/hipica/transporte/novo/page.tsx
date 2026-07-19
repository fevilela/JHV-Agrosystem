import { prisma } from "@/lib/prisma";
import { TransportForm } from "../transport-form";
import { createTransportAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewTransportPage() {
  const { organizationId } = await requireModule("hipica");
  const animals = await prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Transporte</h1>
      <TransportForm
        action={createTransportAction}
        animals={animals}
        backHref="/hipica/transporte"
      />
    </div>
  );
}
