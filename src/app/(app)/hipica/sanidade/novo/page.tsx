import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { equineHealthRecordFields } from "../fields";
import { createEquineHealthRecordAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewEquineHealthRecordPage() {
  const { organizationId } = await requireModule("hipica");
  const animals = await prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Sanidade</h1>
      <RecordForm
        fields={equineHealthRecordFields}
        action={createEquineHealthRecordAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: a.name })),
        }}
        backHref="/hipica/sanidade"
      />
    </div>
  );
}
