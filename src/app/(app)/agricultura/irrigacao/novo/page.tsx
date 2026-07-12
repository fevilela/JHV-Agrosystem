import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { irrigationFields } from "../fields";
import { createIrrigationAction } from "../actions";

export default async function NewIrrigationPage() {
  const talhoes = await prisma.talhao.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Irrigação</h1>
      <RecordForm
        fields={irrigationFields}
        action={createIrrigationAction}
        relationOptions={{
          talhaoId: talhoes.map((t) => ({ id: t.id, label: t.code })),
        }}
        backHref="/agricultura/irrigacao"
      />
    </div>
  );
}
