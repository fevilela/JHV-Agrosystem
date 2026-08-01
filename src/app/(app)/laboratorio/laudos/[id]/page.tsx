import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LaudoForm } from "../laudo-form";
import { updateLaudoAction, deleteLaudoAction, emitirLaudoAction, cancelarLaudoAction, reemitirLaudoAction } from "../actions";
import { laudoStatusLabels, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";

export default async function LaudoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const laudo = await prisma.laudoTecnico.findFirst({
    where: { id, organizationId },
    include: { amostras: true },
  });
  if (!laudo) notFound();

  const [produtores, responsaveis, amostras] = await Promise.all([
    prisma.produtor.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.responsavelTecnico.findMany({
      where: { organizationId, active: true },
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
    }),
    prisma.amostra.findMany({ where: { organizationId }, orderBy: { code: "asc" }, include: { propriedadeProdutor: true } }),
  ]);

  return (
    <div>
      <Link href="/laboratorio/laudos" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Laudos Técnicos
      </Link>
      <div className="mt-1 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Laudo {laudo.numero} {laudo.versao > 1 ? `(v${laudo.versao})` : ""}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {laudoStatusLabels[laudo.status]}
            {laudo.dataEmissao ? ` · Emitido em ${formatDate(laudo.dataEmissao)}` : ""}
          </p>
        </div>
        <DeleteButton onDelete={deleteLaudoAction.bind(null, id)} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {laudo.status === "RASCUNHO" && (
          <form action={emitirLaudoAction.bind(null, id)}>
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
            >
              Emitir Laudo
            </button>
          </form>
        )}
        {(laudo.status === "EMITIDO" || laudo.status === "REEMITIDO") && (
          <>
            <form action={reemitirLaudoAction.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Reemitir (nova versão)
              </button>
            </form>
            <form action={cancelarLaudoAction.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancelar Laudo
              </button>
            </form>
          </>
        )}
      </div>

      <LaudoForm
        action={updateLaudoAction.bind(null, id)}
        produtores={produtores.map((p) => ({ id: p.id, label: p.name }))}
        responsaveis={responsaveis.map((r) => ({
          id: r.id,
          label: `${r.employee.name} (${r.tipoRegistro} ${r.registroProfissional})`,
        }))}
        amostras={amostras.map((a) => ({ id: a.id, label: `${a.code} — ${a.propriedadeProdutor.name}` }))}
        initialValues={laudo}
        selectedAmostraIds={laudo.amostras.map((la) => la.amostraId)}
        backHref="/laboratorio/laudos"
      />
    </div>
  );
}
