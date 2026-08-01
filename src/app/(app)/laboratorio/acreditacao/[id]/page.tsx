import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { acreditacaoFields } from "../fields";
import { updateAcreditacaoAction, addAuditoriaEventoAction } from "../actions";
import { formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";

export default async function AcreditacaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const acreditacao = await prisma.acreditacaoLaboratorio.findFirst({
    where: { id, organizationId },
    include: { auditorias: { orderBy: { data: "desc" } } },
  });
  if (!acreditacao) notFound();

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600";

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">
        {acreditacao.escopoAcreditacao || "Registro de Acreditação"}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={acreditacaoFields}
          action={updateAcreditacaoAction.bind(null, id)}
          initialValues={acreditacao}
          backHref="/laboratorio/acreditacao"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Auditorias de Manutenção da Acreditação
          </h2>

          {acreditacao.auditorias.length === 0 ? (
            <p className="mb-4 text-sm text-neutral-400">Nenhuma auditoria registrada ainda.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {acreditacao.auditorias.map((a) => (
                <li key={a.id} className="border-b border-neutral-100 pb-2 text-sm last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-neutral-800">{a.resultado || "Auditoria"}</p>
                    <span className="text-xs text-neutral-400">{formatDate(a.data)}</span>
                  </div>
                  {a.notes && <p className="text-xs text-neutral-500">{a.notes}</p>}
                </li>
              ))}
            </ul>
          )}

          <form
            action={addAuditoriaEventoAction.bind(null, id)}
            className="space-y-2 border-t border-neutral-100 pt-4"
          >
            <input name="resultado" placeholder="Resultado da auditoria" className={inputClass} />
            <textarea name="notes" placeholder="Observações" rows={2} className={inputClass} />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
            >
              Registrar Auditoria
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
