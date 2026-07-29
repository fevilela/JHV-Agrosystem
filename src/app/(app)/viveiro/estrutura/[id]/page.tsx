import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { viveiroFields } from "../fields";
import { updateViveiroAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditViveiroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("viveiro");

  const [viveiro, properties] = await Promise.all([
    prisma.viveiro.findFirst({ where: { id, organizationId } }),
    prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!viveiro) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Viveiro</h1>
      <RecordForm
        fields={viveiroFields}
        action={updateViveiroAction.bind(null, id)}
        initialValues={viveiro}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/viveiro/estrutura"
      />
    </div>
  );
}
