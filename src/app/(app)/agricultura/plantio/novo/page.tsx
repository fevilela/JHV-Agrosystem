import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { plantioFields } from "../fields";
import { createPlantioAction } from "../actions";

export default async function NewPlantioPage() {
  const safras = await prisma.safra.findMany({
    orderBy: { name: "asc" },
    include: { talhao: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Plantio</h1>
      <RecordForm
        fields={plantioFields}
        action={createPlantioAction}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/plantio"
      />
    </div>
  );
}
