import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { equipamentoFields } from "../fields";
import { updateEquipamentoAction, createManutencaoAction } from "../actions";
import { formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";

export default async function EquipamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireModule("laboratorio");

  const equipamento = await prisma.equipamento.findFirst({
    where: { id, organizationId },
    include: { manutencoes: { orderBy: { data: "desc" } } },
  });
  if (!equipamento) notFound();

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600";

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{equipamento.nome}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={equipamentoFields}
          action={updateEquipamentoAction.bind(null, id)}
          initialValues={equipamento}
          backHref="/laboratorio/equipamentos"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Histórico de Manutenções
          </h2>

          {equipamento.manutencoes.length === 0 ? (
            <p className="mb-4 text-sm text-neutral-400">Nenhuma manutenção registrada ainda.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {equipamento.manutencoes.map((m) => (
                <li key={m.id} className="border-b border-neutral-100 pb-2 text-sm last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-neutral-800">{m.descricao || "Manutenção"}</p>
                    <span className="text-xs text-neutral-400">{formatDate(m.data)}</span>
                  </div>
                  {m.responsavel && <p className="text-xs text-neutral-500">Responsável: {m.responsavel}</p>}
                </li>
              ))}
            </ul>
          )}

          <form action={createManutencaoAction.bind(null, id)} className="space-y-2 border-t border-neutral-100 pt-4">
            <input name="descricao" placeholder="Descrição da manutenção" className={inputClass} />
            <input name="responsavel" placeholder="Responsável (interno/terceirizado)" className={inputClass} />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
            >
              Registrar Manutenção
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
