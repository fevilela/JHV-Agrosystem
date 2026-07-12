import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { talhaoFields } from "../fields";
import { updateTalhaoAction } from "../actions";

export default async function EditTalhaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const talhao = await prisma.talhao.findUnique({ where: { id } });
  if (!talhao) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Talhão</h1>
      <RecordForm
        fields={talhaoFields}
        action={updateTalhaoAction.bind(null, id)}
        initialValues={talhao}
        backHref="/agricultura/talhoes"
      />
    </div>
  );
}
