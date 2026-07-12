import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { loteFields } from "../../lote-fields";
import { updateLoteAction } from "../../lote-actions";

export default async function EditLotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lote = await prisma.lote.findUnique({ where: { id } });
  if (!lote) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Lote</h1>
      <RecordForm
        fields={loteFields}
        action={updateLoteAction.bind(null, id)}
        initialValues={lote}
        backHref="/pecuaria/manejo/lotes"
      />
    </div>
  );
}
