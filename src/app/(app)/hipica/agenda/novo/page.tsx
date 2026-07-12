import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { agendaFields } from "../fields";
import { createAgendaAction } from "../actions";

export default async function NewAgendaPage() {
  const animals = await prisma.animal.findMany({ orderBy: { name: "asc" } });

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
