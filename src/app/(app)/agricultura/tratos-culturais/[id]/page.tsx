import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { tratoFields } from "../fields";
import { updateTratoAction } from "../actions";

export default async function EditTratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trato, safras] = await Promise.all([
    prisma.tratoCultural.findUnique({ where: { id } }),
    prisma.safra.findMany({ orderBy: { name: "asc" }, include: { talhao: true } }),
  ]);

  if (!trato) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Trato Cultural</h1>
      <RecordForm
        fields={tratoFields}
        action={updateTratoAction.bind(null, id)}
        initialValues={trato}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/tratos-culturais"
      />
    </div>
  );
}
