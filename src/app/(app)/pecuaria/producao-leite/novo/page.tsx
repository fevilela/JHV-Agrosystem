import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { milkFields } from "../fields";
import { createMilkAction } from "../actions";

export default async function NewMilkPage() {
  const animals = await prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Ordenha</h1>
      <RecordForm
        fields={milkFields}
        action={createMilkAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/producao-leite"
      />
    </div>
  );
}
