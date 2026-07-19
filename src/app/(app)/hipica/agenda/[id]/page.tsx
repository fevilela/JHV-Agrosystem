import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { agendaFields } from "../fields";
import { updateAgendaAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditAgendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("hipica");

  const [event, animals] = await Promise.all([
    prisma.agendaEvent.findFirst({ where: { id, organizationId } }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!event) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Evento</h1>
      <RecordForm
        fields={agendaFields}
        action={updateAgendaAction.bind(null, id)}
        initialValues={event}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/agenda"
      />
    </div>
  );
}
