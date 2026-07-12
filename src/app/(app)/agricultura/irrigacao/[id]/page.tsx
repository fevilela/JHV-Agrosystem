import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { irrigationFields } from "../fields";
import { updateIrrigationAction } from "../actions";

export default async function EditIrrigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, talhoes] = await Promise.all([
    prisma.irrigation.findUnique({ where: { id } }),
    prisma.talhao.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!record) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Registro de Irrigação</h1>
      <RecordForm
        fields={irrigationFields}
        action={updateIrrigationAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          talhaoId: talhoes.map((t) => ({ id: t.id, label: t.code })),
        }}
        backHref="/agricultura/irrigacao"
      />
    </div>
  );
}
