import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { weightFields } from "../fields";
import { createWeightAction } from "../actions";

export default async function NewWeightPage() {
  const animals = await prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Pesagem</h1>
      <RecordForm
        fields={weightFields}
        action={createWeightAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/pesagens"
      />
    </div>
  );
}
