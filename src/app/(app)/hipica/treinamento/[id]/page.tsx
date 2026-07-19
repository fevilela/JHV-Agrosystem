import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { trainingFields } from "../fields";
import { updateTrainingAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const [session, animals, instructors] = await Promise.all([
    prisma.trainingSession.findFirst({ where: { id, organizationId } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
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
