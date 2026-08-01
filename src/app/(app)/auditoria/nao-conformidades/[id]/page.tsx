import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { naoConformidadeFields } from "../fields";
import { updateNaoConformidadeAction } from "../actions";
import { requireModule } from "@/lib/tenant";

export default async function EditNaoConformidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("auditoria");

  const [naoConformidade, auditorias, resultados] = await Promise.all([
    prisma.naoConformidade.findFirst({ where: { id, organizationId } }),
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
  if (!naoConformidade) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Não Conformidade</h1>
      <RecordForm
        fields={naoConformidadeFields}
        action={updateNaoConformidadeAction.bind(null, id)}
        initialValues={naoConformidade}
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
