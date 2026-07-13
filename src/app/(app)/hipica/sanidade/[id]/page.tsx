import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { equineHealthRecordFields } from "../fields";
import { updateEquineHealthRecordAction } from "../actions";

export default async function EditEquineHealthRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, animals] = await Promise.all([
    prisma.equineHealthRecord.findUnique({ where: { id } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!record) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Registro de Sanidade</h1>
      <RecordForm
        fields={equineHealthRecordFields}
        action={updateEquineHealthRecordAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/sanidade"
      />
    </div>
  );
}
