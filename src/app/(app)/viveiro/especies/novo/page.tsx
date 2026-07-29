import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mudaEspecieFields } from "../fields";
import { createMudaEspecieAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewMudaEspeciePage() {
  const { organizationId } = await requireModule("viveiro");
  const suppliers = await prisma.supplier.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Espécie/Cultivar</h1>
      <RecordForm
        fields={mudaEspecieFields}
        action={createMudaEspecieAction}
        relationOptions={{
          fornecedorId: suppliers.map((s) => ({ id: s.id, label: s.name })),
        }}
        backHref="/viveiro/especies"
      />
    </div>
  );
}
