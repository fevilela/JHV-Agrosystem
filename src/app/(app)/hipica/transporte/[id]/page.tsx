import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransportForm } from "../transport-form";
import { updateTransportAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditTransportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const [transport, animals] = await Promise.all([
    prisma.transport.findFirst({
      where: { id, organizationId },
      include: { animals: true },
    }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!transport) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Transporte</h1>
      <TransportForm
        action={updateTransportAction.bind(null, id)}
        transport={transport}
        animals={animals}
        selectedAnimalIds={transport.animals.map((a) => a.animalId)}
        backHref="/hipica/transporte"
      />
    </div>
  );
}
