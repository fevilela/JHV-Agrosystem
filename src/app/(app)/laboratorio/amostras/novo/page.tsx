import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { amostraFields } from "../fields";
import { createAmostraAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewAmostraPage() {
  const { organizationId } = await requireModule("laboratorio");
  const propriedades = await prisma.propriedadeProdutor.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: { produtor: true, talhoes: true },
  });

  const talhoes = propriedades.flatMap((p) =>
    p.talhoes.map((t) => ({ id: t.id, label: `${p.name} / ${t.code}` }))
  );

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Amostra</h1>
      <RecordForm
        fields={amostraFields}
        action={createAmostraAction}
        relationOptions={{
          propriedadeProdutorId: propriedades.map((p) => ({
            id: p.id,
            label: `${p.name} (${p.produtor.name})`,
          })),
          talhaoProdutorId: talhoes,
        }}
        backHref="/laboratorio/amostras"
      />
    </div>
  );
}
