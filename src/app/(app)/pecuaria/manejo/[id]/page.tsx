import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { movementFields } from "../fields";
import { updateMovementAction } from "../actions";

export default async function EditMovementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [movement, animals, lotes] = await Promise.all([
    prisma.managementMovement.findUnique({ where: { id } }),
    prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } }),
    prisma.lote.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!movement) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Movimentação</h1>
      <RecordForm
        fields={movementFields}
        action={updateMovementAction.bind(null, id)}
        initialValues={movement}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/manejo"
      />
    </div>
  );
}
