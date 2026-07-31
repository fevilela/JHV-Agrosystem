import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { propriedadeFields } from "../fields";
import { updatePropriedadeAction, createTalhaoAction, deleteTalhaoAction } from "../actions";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";

export default async function PropriedadeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const propriedade = await prisma.propriedadeProdutor.findFirst({
    where: { id, organizationId },
    include: { talhoes: { orderBy: { code: "asc" } } },
  });
  if (!propriedade) notFound();

  const produtores = await prisma.produtor.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600";

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{propriedade.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={propriedadeFields}
          action={updatePropriedadeAction.bind(null, id)}
          initialValues={propriedade}
          relationOptions={{
            produtorId: produtores.map((p) => ({ id: p.id, label: p.name })),
          }}
          backHref="/laboratorio/propriedades"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Talhões
          </h2>

          {propriedade.talhoes.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhum talhão cadastrado ainda.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {propriedade.talhoes.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-neutral-800">{t.code}</p>
                    <p className="text-xs text-neutral-500">
                      {t.culturaImplantada || "Cultura não informada"}
                      {t.areaHa ? ` · ${t.areaHa} ha` : ""}
                    </p>
                  </div>
                  <DeleteButton onDelete={deleteTalhaoAction.bind(null, id, t.id)} />
                </li>
              ))}
            </ul>
          )}

          <form action={createTalhaoAction.bind(null, id)} className="space-y-2 border-t border-neutral-100 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <input name="code" placeholder="Código/Nome do talhão" required className={inputClass} />
              <input name="areaHa" type="number" step="0.01" placeholder="Área (ha)" className={inputClass} />
              <input name="culturaImplantada" placeholder="Cultura implantada" className={inputClass} />
              <input name="tipoSolo" placeholder="Tipo de solo" className={inputClass} />
            </div>
            <textarea
              name="historicoUso"
              placeholder="Histórico de uso (safras anteriores)"
              rows={2}
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
            >
              Adicionar Talhão
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
