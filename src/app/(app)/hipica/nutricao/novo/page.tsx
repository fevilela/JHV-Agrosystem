import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { dietFields } from "../fields";
import { createDietAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewDietPage() {
  const { organizationId } = await requireModule("hipica");
  const animals = await prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Dieta</h1>
      <RecordForm
        fields={dietFields}
        action={createDietAction}
        initialValues={{ active: true }}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/nutricao"
      />
    </div>
  );
}
