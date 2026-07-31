import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { amostraFields } from "../fields";
import {
  updateAmostraAction,
  updateAmostraStatusAction,
  addCustodiaEventoAction,
  deleteAmostraAction,
  createResultadoAction,
  updateResultadoStatusAction,
  deleteResultadoAction,
  addControleQualidadeAction,
} from "../actions";
import {
  amostraStatusLabels,
  custodiaLocalLabels,
  resultadoStatusLabels,
  controleQualidadeTipoLabels,
  controleQualidadeResultadoLabels,
  formatDate,
} from "@/lib/labels";
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
      resultados: {
        orderBy: { dataAnalise: "desc" },
        include: {
          metodoAnalitico: true,
          analista: true,
          equipamento: true,
          loteReagente: { include: { stockItem: true } },
          controlesQualidade: { orderBy: { data: "desc" } },
        },
      },
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

  const [metodos, analistas, equipamentos, lotesReagente] = await Promise.all([
    prisma.metodoAnalitico.findMany({ where: { organizationId, active: true }, orderBy: { nomeParametro: "asc" } }),
    prisma.employee.findMany({ where: { organizationId, active: true }, orderBy: { name: "asc" } }),
    prisma.equipamento.findMany({ where: { organizationId }, orderBy: { nome: "asc" } }),
    prisma.stockBatch.findMany({
      where: { status: "DISPONIVEL", stockItem: { organizationId, category: "REAGENTE" } },
      include: { stockItem: true },
      orderBy: { entryDate: "desc" },
    }),
  ]);

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

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Resultados de Análise
        </h2>

        {amostra.resultados.length === 0 ? (
          <p className="mb-4 text-sm text-neutral-400">Nenhum resultado registrado ainda.</p>
        ) : (
          <div className="mb-6 space-y-4">
            {amostra.resultados.map((r) => (
              <div key={r.id} className="rounded-xl border border-neutral-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-800">
                      {r.metodoAnalitico.nomeParametro}: {String(r.valor)}
                      {r.metodoAnalitico.unidadeMedida ? ` ${r.metodoAnalitico.unidadeMedida}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(r.dataAnalise)}
                      {r.analista ? ` · Analista: ${r.analista.name}` : ""}
                      {r.equipamento ? ` · Equip.: ${r.equipamento.nome}` : ""}
                      {r.loteReagente ? ` · Reagente: ${r.loteReagente.stockItem.name}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "VALIDADO"
                        ? "bg-green-50 text-green-700"
                        : r.status === "REPROVADO"
                          ? "bg-red-50 text-red-700"
                          : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {resultadoStatusLabels[r.status]}
                  </span>
                </div>

                {r.observacoes && <p className="mt-2 text-xs text-neutral-500">{r.observacoes}</p>}

                {r.controlesQualidade.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-2">
                    {r.controlesQualidade.map((c) => (
                      <li key={c.id} className="text-xs text-neutral-600">
                        {controleQualidadeTipoLabels[c.tipo]} —{" "}
                        <span
                          className={c.resultadoControle === "DENTRO_FAIXA" ? "text-green-700" : "text-red-600"}
                        >
                          {controleQualidadeResultadoLabels[c.resultadoControle]}
                        </span>
                        {c.acaoCorretiva ? ` · Ação: ${c.acaoCorretiva}` : ""}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                  {r.status !== "VALIDADO" && (
                    <form action={updateResultadoStatusAction.bind(null, id, r.id, "VALIDADO")}>
                      <button
                        type="submit"
                        className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700 transition hover:bg-neutral-100"
                      >
                        Validar
                      </button>
                    </form>
                  )}
                  {r.status !== "REPROVADO" && (
                    <form action={updateResultadoStatusAction.bind(null, id, r.id, "REPROVADO")}>
                      <button
                        type="submit"
                        className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700 transition hover:bg-neutral-100"
                      >
                        Reprovar
                      </button>
                    </form>
                  )}
                  <DeleteButton onDelete={deleteResultadoAction.bind(null, id, r.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          action={createResultadoAction.bind(null, id)}
          className="grid grid-cols-1 gap-2 border-t border-neutral-100 pt-4 sm:grid-cols-3"
        >
          <select name="metodoAnaliticoId" required className={inputClass}>
            <option value="">Parâmetro/Método</option>
            {metodos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nomeParametro}
              </option>
            ))}
          </select>
          <input name="valor" type="number" step="0.0001" placeholder="Valor obtido" required className={inputClass} />
          <input name="dataAnalise" type="date" required className={inputClass} />
          <select name="analistaId" className={inputClass}>
            <option value="">Analista responsável</option>
            {analistas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select name="equipamentoId" className={inputClass}>
            <option value="">Equipamento utilizado</option>
            {equipamentos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
          <select name="loteReagenteId" className={inputClass}>
            <option value="">Lote de reagente</option>
            {lotesReagente.map((b) => (
              <option key={b.id} value={b.id}>
                {b.stockItem.name}
                {b.batchNumber ? ` — Lote ${b.batchNumber}` : ""}
              </option>
            ))}
          </select>
          <input name="repeticoes" type="number" placeholder="Repetições" className={inputClass} />
          <input
            name="observacoes"
            placeholder="Observações técnicas"
            className={`${inputClass} sm:col-span-2`}
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800 sm:col-span-1"
          >
            Registrar Resultado
          </button>
        </form>

        {amostra.resultados.length > 0 && (
          <form
            action={addControleQualidadeAction.bind(null, id)}
            className="mt-6 grid grid-cols-1 gap-2 border-t border-neutral-100 pt-4 sm:grid-cols-3"
          >
            <p className="text-xs font-medium text-neutral-500 sm:col-span-3">
              Controle de Qualidade (branco, duplicata, padrão de referência)
            </p>
            <select name="resultadoId" required className={inputClass}>
              <option value="">Resultado verificado</option>
              {amostra.resultados.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.metodoAnalitico.nomeParametro} ({String(r.valor)})
                </option>
              ))}
            </select>
            <select name="tipo" required className={inputClass}>
              {Object.entries(controleQualidadeTipoLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select name="resultadoControle" required className={inputClass}>
              {Object.entries(controleQualidadeResultadoLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input name="valorObtido" type="number" step="0.0001" placeholder="Valor obtido" className={inputClass} />
            <input name="faixaAceitavelMin" type="number" step="0.0001" placeholder="Faixa mín." className={inputClass} />
            <input name="faixaAceitavelMax" type="number" step="0.0001" placeholder="Faixa máx." className={inputClass} />
            <input
              name="acaoCorretiva"
              placeholder="Ação corretiva (se reprovado)"
              className={`${inputClass} sm:col-span-2`}
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
            >
              Registrar Controle
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
