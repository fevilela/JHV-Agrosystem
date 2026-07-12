import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { feedingFields } from "../fields";
import { createFeedingAction } from "../actions";

export default async function NewFeedingPage() {
  const lotes = await prisma.lote.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Nutrição</h1>
      <RecordForm
        fields={feedingFields}
        action={createFeedingAction}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
        }}
        backHref="/pecuaria/nutricao"
      />
    </div>
  );
}
