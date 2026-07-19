import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { competitionFields } from "../fields";
import { createCompetitionAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewCompetitionPage() {
  const { organizationId } = await requireModule("hipica");
  const animals = await prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Participação</h1>
      <RecordForm
        fields={competitionFields}
        action={createCompetitionAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/competicoes"
      />
    </div>
  );
}
