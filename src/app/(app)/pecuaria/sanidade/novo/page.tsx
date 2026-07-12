import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { healthRecordFields } from "../fields";
import { createHealthRecordAction } from "../actions";

export default async function NewHealthRecordPage() {
  const animals = await prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Sanidade</h1>
      <RecordForm
        fields={healthRecordFields}
        action={createHealthRecordAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/sanidade"
      />
    </div>
  );
}
