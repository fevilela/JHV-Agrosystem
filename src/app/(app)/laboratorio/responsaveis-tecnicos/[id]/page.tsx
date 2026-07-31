import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { responsavelTecnicoEditFields } from "../fields";
import { updateResponsavelTecnicoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditResponsavelTecnicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const responsavel = await prisma.responsavelTecnico.findFirst({
    where: { id, organizationId },
    include: { employee: true },
  });
  if (!responsavel) notFound();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-neutral-900">Editar Responsável Técnico</h1>
      <p className="mb-6 text-sm text-neutral-500">Funcionário: {responsavel.employee.name}</p>
      <RecordForm
        fields={responsavelTecnicoEditFields}
        action={updateResponsavelTecnicoAction.bind(null, id)}
        initialValues={responsavel}
        backHref="/laboratorio/responsaveis-tecnicos"
      />
    </div>
  );
}
