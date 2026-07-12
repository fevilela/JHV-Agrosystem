import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { livestockAnimalFields } from "../fields";
import { createLivestockAnimalAction } from "../actions";

export default async function NewLivestockAnimalPage() {
  const [lotes, pastures] = await Promise.all([
    prisma.lote.findMany({ orderBy: { code: "asc" } }),
    prisma.pasture.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Animal</h1>
      <RecordForm
        fields={livestockAnimalFields}
        action={createLivestockAnimalAction}
        initialValues={{ status: "ATIVO" }}
        relationOptions={{
          loteId: lotes.map((l) => ({ id: l.id, label: l.code })),
          pastureId: pastures.map((p) => ({ id: p.id, label: p.code })),
        }}
        backHref="/pecuaria/cadastro-animal"
      />
    </div>
  );
}
