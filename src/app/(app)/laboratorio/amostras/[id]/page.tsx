import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { amostraFields } from "../fields";
import { updateAmostraAction, updateAmostraStatusAction, addCustodiaEventoAction, deleteAmostraAction } from "../actions";
import { amostraStatusLabels, custodiaLocalLabels, formatDate } from "@/lib/labels";
import { getStatusTransitions } from "@/lib/amostra";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";

export default async function AmostraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const amostra = await prisma.amostra.findFirst({
    where: { id, organizationId },
    include: {
      propriedadeProdutor: { include: { produtor: true } },
      talhaoProdutor: true,
      custodiaEventos: { orderBy: { dataHora: "asc" } },
    },
  });
  if (!amostra) notFound();

  const propriedades = await prisma.propriedadeProdutor.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: { produtor: true, talhoes: true },
  });
  const talhoes = propriedades.flatMap((p) =>
    p.talhoes.map((t) => ({ id: t.id, label: `${p.name} / ${t.code}` }))
  );

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600";

  return (
    <div>
      <Link href="/laboratorio/amostras" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Amostras
      </Link>
      <div className="mt-1 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Amostra {amostra.code}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {amostra.propriedadeProdutor.produtor.name} · {amostra.propriedadeProdutor.name}
            {amostra.talhaoProdutor ? ` / ${amostra.talhaoProdutor.code}` : ""}
          </p>
        </div>
        <DeleteButton onDelete={deleteAmostraAction.bind(null, id)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={amostraFields}
          action={updateAmostraAction.bind(null, id)}
          initialValues={amostra}
          relationOptions={{
            propriedadeProdutorId: propriedades.map((p) => ({
              id: p.id,
              label: `${p.name} (${p.produtor.name})`,
            })),
            talhaoProdutorId: talhoes,
          }}
          backHref="/laboratorio/amostras"
        />

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Status</h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
                {amostraStatusLabels[amostra.status]}
              </span>
            </div>
            {getStatusTransitions(amostra.status).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getStatusTransitions(amostra.status).map((transition) => (
                  <form key={transition.next} action={updateAmostraStatusAction.bind(null, id, transition.next)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {transition.label}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Amostra em status final, sem mais transições.</p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Cadeia de Custódia
            </h2>
            {amostra.custodiaEventos.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhuma movimentação registrada ainda.</p>
            ) : (
              <ul className="mb-4 space-y-3">
                {amostra.custodiaEventos.map((event) => (
                  <li key={event.id} className="border-b border-neutral-100 pb-3 text-sm last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-neutral-800">{custodiaLocalLabels[event.local]}</p>
                      <span className="text-xs text-neutral-400">{formatDate(event.dataHora)}</span>
                    </div>
                    {event.responsavelMovimentacao && (
                      <p className="text-xs text-neutral-500">Responsável: {event.responsavelMovimentacao}</p>
                    )}
                    {event.temperaturaArmazenamento !== null && (
                      <p className="text-xs text-neutral-500">
                        Temperatura: {String(event.temperaturaArmazenamento)}°C
                      </p>
                    )}
                    {event.notes && <p className="text-xs text-neutral-500">{event.notes}</p>}
                  </li>
                ))}
              </ul>
            )}

            <form
              action={addCustodiaEventoAction.bind(null, id)}
              className="space-y-2 border-t border-neutral-100 pt-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <select name="local" defaultValue="SETOR_ANALISE" className={inputClass}>
                  {Object.entries(custodiaLocalLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input name="responsavelMovimentacao" placeholder="Responsável pela movimentação" className={inputClass} />
                <input
                  name="temperaturaArmazenamento"
                  type="number"
                  step="0.1"
                  placeholder="Temperatura (°C, opcional)"
                  className={inputClass}
                />
              </div>
              <textarea name="notes" placeholder="Observações" rows={2} className={inputClass} />
              <button
                type="submit"
                className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
              >
                Registrar Movimentação
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
