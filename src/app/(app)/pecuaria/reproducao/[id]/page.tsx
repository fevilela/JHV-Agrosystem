import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { reproductionFields } from "../fields";
import { updateReproductionAction } from "../actions";

export default async function EditReproductionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, animals] = await Promise.all([
    prisma.reproduction.findUnique({ where: { id } }),
    prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } }),
  ]);

  if (!record) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Registro de Reprodução</h1>
      <RecordForm
        fields={reproductionFields}
        action={updateReproductionAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/reproducao"
      />
    </div>
  );
}
