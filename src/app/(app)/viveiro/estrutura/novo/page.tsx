import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { viveiroFields } from "../fields";
import { createViveiroAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewViveiroPage() {
  const { organizationId } = await requireModule("viveiro");
  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Viveiro</h1>
      <RecordForm
        fields={viveiroFields}
        action={createViveiroAction}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/viveiro/estrutura"
      />
    </div>
  );
}
