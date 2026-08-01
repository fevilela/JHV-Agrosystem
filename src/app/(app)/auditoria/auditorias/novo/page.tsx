import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { auditoriaFields } from "../fields";
import { createAuditoriaAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewAuditoriaPage() {
  const { organizationId } = await requireModule("auditoria");
  const propriedades = await prisma.propriedadeProdutor.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: { produtor: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Auditoria</h1>
      <RecordForm
        fields={auditoriaFields}
        action={createAuditoriaAction}
        relationOptions={{
          propriedadeProdutorId: propriedades.map((p) => ({ id: p.id, label: `${p.name} (${p.produtor.name})` })),
        }}
        backHref="/auditoria/auditorias"
      />
    </div>
  );
}
