import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { trainingFields } from "../fields";
import { createTrainingAction } from "../actions";

export default async function NewTrainingPage() {
  const [animals, instructors] = await Promise.all([
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        Nova Sessão de Treinamento
      </h1>
      <RecordForm
        fields={trainingFields}
        action={createTrainingAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
          instructorId: instructors.map((i) => ({ id: i.id, label: i.name })),
        }}
        backHref="/hipica/treinamento"
      />
    </div>
  );
}
