import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { dietFields } from "../fields";
import { updateDietAction } from "../actions";

export default async function EditDietPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [diet, animals] = await Promise.all([
    prisma.animalDiet.findUnique({ where: { id } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!diet) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Dieta</h1>
      <RecordForm
        fields={dietFields}
        action={updateDietAction.bind(null, id)}
        initialValues={diet}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/nutricao"
      />
    </div>
  );
}
