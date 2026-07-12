import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { trainingFields } from "../fields";
import { updateTrainingAction } from "../actions";

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, animals, instructors] = await Promise.all([
    prisma.trainingSession.findUnique({ where: { id } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!session) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        Editar Sessão de Treinamento
      </h1>
      <RecordForm
        fields={trainingFields}
        action={updateTrainingAction.bind(null, id)}
        initialValues={session}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
          instructorId: instructors.map((i) => ({ id: i.id, label: i.name })),
        }}
        backHref="/hipica/treinamento"
      />
    </div>
  );
}
