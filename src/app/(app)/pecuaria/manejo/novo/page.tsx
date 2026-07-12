import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { movementFields } from "../fields";
import { createMovementAction } from "../actions";

export default async function NewMovementPage() {
  const [animals, lotes] = await Promise.all([
    prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } }),
    prisma.lote.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Movimentação</h1>
      <RecordForm
        fields={movementFields}
        action={createMovementAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/manejo"
      />
    </div>
  );
}
