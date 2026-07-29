import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mudaEspecieFields } from "../fields";
import { updateMudaEspecieAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditMudaEspeciePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("viveiro");

  const [especie, suppliers] = await Promise.all([
    prisma.mudaEspecie.findFirst({ where: { id, organizationId } }),
    prisma.supplier.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!especie) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Espécie/Cultivar</h1>
      <RecordForm
        fields={mudaEspecieFields}
        action={updateMudaEspecieAction.bind(null, id)}
        initialValues={especie}
        relationOptions={{
          fornecedorId: suppliers.map((s) => ({ id: s.id, label: s.name })),
        }}
        backHref="/viveiro/especies"
      />
    </div>
  );
}
