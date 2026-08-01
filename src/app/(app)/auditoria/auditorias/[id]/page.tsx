import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { auditoriaFields } from "../fields";
import { updateAuditoriaAction, addChecklistItemAction, deleteChecklistItemAction } from "../actions";
import { conformidadeStatusLabels } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";

const conformidadeColor: Record<string, string> = {
  CONFORME: "bg-green-50 text-green-700",
  NAO_CONFORME: "bg-red-50 text-red-700",
  NAO_APLICAVEL: "bg-neutral-100 text-neutral-600",
};

export default async function AuditoriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("auditoria");

  const auditoria = await prisma.auditoriaAgricola.findFirst({
    where: { id, organizationId },
    include: { itens: { orderBy: { createdAt: "asc" } } },
  });
  if (!auditoria) notFound();

  const propriedades = await prisma.propriedadeProdutor.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: { produtor: true },
  });

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600";

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Auditoria</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={auditoriaFields}
          action={updateAuditoriaAction.bind(null, id)}
          initialValues={auditoria}
          relationOptions={{
            propriedadeProdutorId: propriedades.map((p) => ({ id: p.id, label: `${p.name} (${p.produtor.name})` })),
          }}
          backHref="/auditoria/auditorias"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Checklist / Itens Avaliados
          </h2>

          {auditoria.itens.length === 0 ? (
            <p className="mb-4 text-sm text-neutral-400">Nenhum item avaliado ainda.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {auditoria.itens.map((item) => (
                <li key={item.id} className="rounded-lg border border-neutral-100 p-3 text-sm">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-neutral-800">{item.descricao}</p>
                    <DeleteButton onDelete={deleteChecklistItemAction.bind(null, id, item.id)} />
                  </div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${conformidadeColor[item.conformidade]}`}
                  >
                    {conformidadeStatusLabels[item.conformidade]}
                  </span>
                  {item.notes && <p className="mt-1 text-xs text-neutral-500">{item.notes}</p>}
                </li>
              ))}
            </ul>
          )}

          <form
            action={addChecklistItemAction.bind(null, id)}
            className="space-y-2 border-t border-neutral-100 pt-4"
          >
            <input name="descricao" placeholder="Item avaliado" required className={inputClass} />
            <div className="grid grid-cols-2 gap-2">
              <select name="conformidade" defaultValue="NAO_APLICAVEL" className={inputClass}>
                {Object.entries(conformidadeStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input name="evidenciaUrl" placeholder="Evidência (link/URL)" className={inputClass} />
            </div>
            <textarea name="notes" placeholder="Observações" rows={2} className={inputClass} />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
            >
              Adicionar Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
