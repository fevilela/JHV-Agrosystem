import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mechanicFields } from "../fields";
import { updateMechanicAction } from "../actions";

export default async function EditMechanicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const mechanic = await prisma.mechanic.findUnique({ where: { id } });
  if (!mechanic) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Mecânico</h1>
      <RecordForm
        fields={mechanicFields}
        action={updateMechanicAction.bind(null, id)}
        initialValues={mechanic}
        backHref="/oficina/pecas"
      />
    </div>
  );
}
