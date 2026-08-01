import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { normaReferenciaFields } from "../fields";
import { createNormaReferenciaAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewNormaReferenciaPage() {
  const { organizationId } = await requireModule("laboratorio");
  const metodos = await prisma.metodoAnalitico.findMany({ where: { organizationId }, orderBy: { nomeParametro: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Norma de Referência</h1>
      <RecordForm
        fields={normaReferenciaFields}
        action={createNormaReferenciaAction}
        relationOptions={{
          metodoAnaliticoId: metodos.map((m) => ({ id: m.id, label: m.nomeParametro })),
        }}
        backHref="/laboratorio/normas"
      />
    </div>
  );
}
