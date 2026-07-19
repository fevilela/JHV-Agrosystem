import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { competitionFields } from "../fields";
import { updateCompetitionAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditCompetitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const [competition, animals] = await Promise.all([
    prisma.competition.findFirst({ where: { id, organizationId } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!competition) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Participação</h1>
      <RecordForm
        fields={competitionFields}
        action={updateCompetitionAction.bind(null, id)}
        initialValues={competition}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/competicoes"
      />
    </div>
  );
}
