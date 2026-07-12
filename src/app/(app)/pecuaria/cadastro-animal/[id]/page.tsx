import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { livestockAnimalFields } from "../fields";
import { updateLivestockAnimalAction } from "../actions";

export default async function EditLivestockAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [animal, lotes, pastures] = await Promise.all([
    prisma.livestockAnimal.findUnique({ where: { id } }),
    prisma.lote.findMany({ orderBy: { code: "asc" } }),
    prisma.pasture.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!animal) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Animal</h1>
      <RecordForm
        fields={livestockAnimalFields}
        action={updateLivestockAnimalAction.bind(null, id)}
        initialValues={animal}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
          pastureId: pastures.map((p) => ({ id: p.id, label: p.code })),
        }}
        backHref="/pecuaria/cadastro-animal"
      />
    </div>
  );
}
