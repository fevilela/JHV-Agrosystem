import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { metodoAnaliticoFields } from "../fields";
import { updateMetodoAnaliticoAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditMetodoAnaliticoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const metodo = await prisma.metodoAnalitico.findFirst({ where: { id, organizationId } });
  if (!metodo) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Método Analítico</h1>
      <RecordForm
        fields={metodoAnaliticoFields}
        action={updateMetodoAnaliticoAction.bind(null, id)}
        initialValues={metodo}
        backHref="/laboratorio/metodos"
      />
    </div>
  );
}
