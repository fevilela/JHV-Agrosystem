import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { equineHealthRecordFields } from "../fields";
import { createEquineHealthRecordAction } from "../actions";

export default async function NewEquineHealthRecordPage() {
  const animals = await prisma.animal.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Sanidade</h1>
      <RecordForm
        fields={equineHealthRecordFields}
        action={createEquineHealthRecordAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/sanidade"
      />
    </div>
  );
}
