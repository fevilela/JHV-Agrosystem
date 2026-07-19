import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { agendaFields } from "../fields";
import { createAgendaAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewAgendaPage() {
  const { organizationId } = await requireModule("hipica");
  const animals = await prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Evento</h1>
      <RecordForm
        fields={agendaFields}
        action={createAgendaAction}
        initialValues={{ status: "AGENDADO" }}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/agenda"
      />
    </div>
  );
}
