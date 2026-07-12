import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { fertilityFields } from "../fields";
import { createFertilityAction } from "../actions";

export default async function NewFertilityPage() {
  const talhoes = await prisma.talhao.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Fertilidade</h1>
      <RecordForm
        fields={fertilityFields}
        action={createFertilityAction}
        relationOptions={{
          talhaoId: talhoes.map((t) => ({ id: t.id, label: t.code })),
        }}
        backHref="/agricultura/fertilidade"
      />
    </div>
  );
}
