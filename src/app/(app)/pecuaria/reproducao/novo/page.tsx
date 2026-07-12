import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { reproductionFields } from "../fields";
import { createReproductionAction } from "../actions";

export default async function NewReproductionPage() {
  const animals = await prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Reprodução</h1>
      <RecordForm
        fields={reproductionFields}
        action={createReproductionAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/reproducao"
      />
    </div>
  );
}
