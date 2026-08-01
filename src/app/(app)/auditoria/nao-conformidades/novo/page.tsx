import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { naoConformidadeFields } from "../fields";
import { createNaoConformidadeAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function NewNaoConformidadePage() {
  const { organizationId } = await requireModule("auditoria");
  const [auditorias, resultados] = await Promise.all([
    prisma.auditoriaAgricola.findMany({
      where: { organizationId },
      orderBy: { dataAuditoria: "desc" },
      include: { propriedadeProdutor: true },
    }),
    prisma.resultado.findMany({
      where: { organizationId },
      orderBy: { dataAnalise: "desc" },
      include: { metodoAnalitico: true, amostra: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Não Conformidade</h1>
      <RecordForm
        fields={naoConformidadeFields}
        action={createNaoConformidadeAction}
        relationOptions={{
          auditoriaId: auditorias.map((a) => ({
            id: a.id,
            label: `${a.propriedadeProdutor.name} — ${a.dataAuditoria.toISOString().slice(0, 10)}`,
          })),
          resultadoId: resultados.map((r) => ({
            id: r.id,
            label: `${r.amostra.code} — ${r.metodoAnalitico.nomeParametro}`,
          })),
        }}
        backHref="/auditoria/nao-conformidades"
      />
    </div>
  );
}
