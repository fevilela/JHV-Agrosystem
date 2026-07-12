import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { costCenterFields } from "../fields";
import { updateCostCenterAction } from "../actions";

export default async function EditCostCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const center = await prisma.costCenter.findUnique({ where: { id } });
  if (!center) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Centro de Custo</h1>
      <RecordForm
        fields={costCenterFields}
        action={updateCostCenterAction.bind(null, id)}
        initialValues={center}
        backHref="/financeiro/centro-custos"
      />
    </div>
  );
}
