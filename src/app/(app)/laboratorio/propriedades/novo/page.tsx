import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { propriedadeFields } from "../fields";
import { createPropriedadeAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewPropriedadePage({
  searchParams,
}: {
  searchParams: Promise<{ produtorId?: string }>;
}) {
  const { organizationId } = await requireModule("laboratorio");
  const { produtorId } = await searchParams;
  const produtores = await prisma.produtor.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Propriedade</h1>
      <RecordForm
        fields={propriedadeFields}
        action={createPropriedadeAction}
        initialValues={produtorId ? { produtorId } : undefined}
        relationOptions={{
          produtorId: produtores.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/laboratorio/propriedades"
      />
    </div>
  );
}
