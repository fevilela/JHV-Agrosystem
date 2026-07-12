import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { feedingFields } from "../fields";
import { updateFeedingAction } from "../actions";

export default async function EditFeedingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [feeding, lotes] = await Promise.all([
    prisma.livestockFeeding.findUnique({ where: { id } }),
    prisma.lote.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!feeding) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Registro de Nutrição</h1>
      <RecordForm
        fields={feedingFields}
        action={updateFeedingAction.bind(null, id)}
        initialValues={feeding}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/nutricao"
      />
    </div>
  );
}
