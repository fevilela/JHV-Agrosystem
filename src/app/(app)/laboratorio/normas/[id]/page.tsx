import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { normaReferenciaFields } from "../fields";
import { updateNormaReferenciaAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditNormaReferenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const [norma, metodos] = await Promise.all([
    prisma.normaReferencia.findFirst({ where: { id, organizationId } }),
    prisma.metodoAnalitico.findMany({ where: { organizationId }, orderBy: { nomeParametro: "asc" } }),
  ]);
  if (!norma) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Norma de Referência</h1>
      <RecordForm
        fields={normaReferenciaFields}
        action={updateNormaReferenciaAction.bind(null, id)}
        initialValues={norma}
        relationOptions={{
          metodoAnaliticoId: metodos.map((m) => ({ id: m.id, label: m.nomeParametro })),
        }}
        backHref="/laboratorio/normas"
      />
    </div>
  );
}
