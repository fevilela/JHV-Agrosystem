import { RecordForm } from "@/components/crud/record-form";
import { piqueteFields } from "../fields";
import { createPiqueteAction } from "../actions";
import { requireModule } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export default async function NewPiquetePage() {
  const { organizationId } = await requireModule("hipica");
  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Piquete</h1>
      <RecordForm
        fields={piqueteFields}
        action={createPiqueteAction}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/hipica/piquetes"
      />
    </div>
  );
}
