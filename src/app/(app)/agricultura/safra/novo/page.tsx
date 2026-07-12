import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { safraFields } from "../fields";
import { createSafraAction } from "../actions";

export default async function NewSafraPage() {
  const talhoes = await prisma.talhao.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Safra</h1>
      <RecordForm
        fields={safraFields}
        action={createSafraAction}
        initialValues={{ status: "PLANEJADA" }}
        relationOptions={{
          talhaoId: talhoes.map((t) => ({ id: t.id, label: t.code })),
        }}
        backHref="/agricultura/safra"
      />
    </div>
  );
}
