import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { pastureFields } from "../fields";
import { updatePastureAction } from "../actions";

export default async function EditPasturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pasture = await prisma.pasture.findUnique({ where: { id } });
  if (!pasture) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Pastagem</h1>
      <RecordForm
        fields={pastureFields}
        action={updatePastureAction.bind(null, id)}
        initialValues={pasture}
        backHref="/pecuaria/pastagens"
      />
    </div>
  );
}
