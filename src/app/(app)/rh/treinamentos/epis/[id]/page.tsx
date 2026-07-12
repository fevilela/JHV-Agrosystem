import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { epiFields } from "../../epi-fields";
import { updateEpiAction } from "../../epi-actions";

export default async function EditEpiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [issuance, employees] = await Promise.all([
    prisma.epiIssuance.findUnique({ where: { id } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!issuance) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Entrega de EPI</h1>
      <RecordForm
        fields={epiFields}
        action={updateEpiAction.bind(null, id)}
        initialValues={issuance}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos/epis"
      />
    </div>
  );
}
