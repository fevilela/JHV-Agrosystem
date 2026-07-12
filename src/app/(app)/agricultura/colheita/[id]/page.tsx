import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { harvestFields } from "../fields";
import { updateHarvestAction } from "../actions";

export default async function EditHarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [harvest, safras] = await Promise.all([
    prisma.harvest.findUnique({ where: { id } }),
    prisma.safra.findMany({ orderBy: { name: "asc" }, include: { talhao: true } }),
  ]);

  if (!harvest) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Colheita</h1>
      <RecordForm
        fields={harvestFields}
        action={updateHarvestAction.bind(null, id)}
        initialValues={harvest}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/colheita"
      />
    </div>
  );
}
