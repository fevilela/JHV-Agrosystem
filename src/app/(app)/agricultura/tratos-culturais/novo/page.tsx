import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { tratoFields } from "../fields";
import { createTratoAction } from "../actions";

export default async function NewTratoPage() {
  const safras = await prisma.safra.findMany({
    orderBy: { name: "asc" },
    include: { talhao: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Trato Cultural</h1>
      <RecordForm
        fields={tratoFields}
        action={createTratoAction}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/tratos-culturais"
      />
    </div>
  );
}
