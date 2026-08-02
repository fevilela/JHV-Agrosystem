import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mudaLoteEditFields } from "../fields";
import { updateMudaLoteAction, advanceFaseAction, deleteMudaLoteAction } from "../actions";
import { faseMudaLabels, mudaLoteStatusLabels, origemPropaguloLabels, formatDate, formatCurrency } from "@/lib/labels";
import { nextFase, phaseLossRates, totalLossRate, calcularCustoLote, custoPorMuda } from "@/lib/muda-lote";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";
import { Tabs } from "@/components/tabs";
import { InsumosSection } from "./insumos-section";
import { IrrigacaoSection } from "./irrigacao-section";
import { FitossanidadeSection } from "./fitossanidade-section";
import { MaoDeObraSection } from "./mao-de-obra-section";
import { CertificadosSection } from "./certificados-section";

export default async function MudaLoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId, organization } = await requireModule("viveiro");
  const locale = await getLocale();

  const lote = await prisma.mudaLote.findFirst({
    where: { id, organizationId },
    include: {
      especie: true,
      faseEventos: { orderBy: { dataEntrada: "asc" } },
      insumos: { include: { stockItem: true }, orderBy: { data: "desc" } },
      irrigacoes: { include: { responsavel: true }, orderBy: { data: "desc" } },
      fitossanidades: { include: { responsavel: true }, orderBy: { data: "desc" } },
      maoDeObra: { include: { employee: true }, orderBy: { data: "desc" } },
      certificados: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!lote) notFound();

  const [viveiros, employees, stockItems] = await Promise.all([
    prisma.viveiro.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
    prisma.employee.findMany({ where: { organizationId, active: true }, orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  const proximaFase = nextFase(lote.faseAtual);
  const perdaPorFase = phaseLossRates(lote.faseEventos, lote.quantidadeInicial);
  const perdaTotal = totalLossRate(lote.faseEventos, lote.quantidadeInicial);

  const custo = calcularCustoLote(
    lote.insumos.map((i) => ({ quantidade: i.quantidade.toString(), unitCost: i.unitCost?.toString() ?? null })),
    lote.maoDeObra.map((m) => ({
      horasTrabalhadas: m.horasTrabalhadas.toString(),
      custoHora: m.custoHora?.toString() ?? null,
    }))
  );
  const custoUnitario = custoPorMuda(custo.custoTotal, lote.quantidadeInicial);

  return (
    <div>
      <Link href="/viveiro/lotes" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Lotes de Produção
      </Link>
      <div className="mt-1 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Lote {lote.code}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {lote.especie.nomePopular} · Origem: {origemPropaguloLabels[lote.origemPropagulo]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/viveiro/lotes/${id}/rastreabilidade/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Baixar PDF de Rastreabilidade
          </a>
          <DeleteButton onDelete={deleteMudaLoteAction.bind(null, id)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={mudaLoteEditFields}
          action={updateMudaLoteAction.bind(null, id)}
          initialValues={lote}
          relationOptions={{
            viveiroId: viveiros.map((v) => ({ id: v.id, label: `${v.code} — ${v.name}` })),
            responsavelId: employees.map((e) => ({ id: e.id, label: e.name })),
          }}
          backHref="/viveiro/lotes"
        />

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Fase Atual
              </h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
                {faseMudaLabels[lote.faseAtual]}
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              Quantidade atual: <strong>{lote.quantidadeAtual}</strong> de {lote.quantidadeInicial} iniciais
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Status: <strong>{mudaLoteStatusLabels[lote.status]}</strong>
            </p>

            {proximaFase && lote.status === "ATIVO" ? (
              <form
                action={advanceFaseAction.bind(null, id)}
                className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    Quantidade perdida nesta fase (opcional)
                  </label>
                  <input
                    type="number"
                    name="quantidadePerdida"
                    min={0}
                    defaultValue={0}
                    className="w-40 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-700 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-800"
                >
                  Avançar para {faseMudaLabels[proximaFase]}
                </button>
              </form>
            ) : (
              <p className="mt-4 border-t border-neutral-100 pt-4 text-sm text-neutral-400">
                {lote.status !== "ATIVO"
                  ? "Lote não está ativo — sem avanço de fase disponível."
                  : "Lote já está na última fase (Pronta para Expedição)."}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Custo do Lote
            </h2>
            <p className="text-sm text-neutral-600">
              Insumos: <strong>{formatCurrency(custo.custoInsumos, locale, organization.currency)}</strong> · Mão de
              obra: <strong>{formatCurrency(custo.custoMaoDeObra, locale, organization.currency)}</strong>
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Custo total: <strong>{formatCurrency(custo.custoTotal, locale, organization.currency)}</strong>
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Custo por muda:{" "}
              <strong>
                {custoUnitario === null
                  ? "—"
                  : formatCurrency(custoUnitario, locale, organization.currency)}
              </strong>
            </p>
            {!custo.completo && (
              <p className="mt-2 text-xs text-amber-700">
                Custo parcial — há insumo(s) ou apontamento(s) de mão de obra sem custo informado,
                não contabilizados aqui.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Taxa de Perda
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="pb-2">Fase</th>
                  <th className="pb-2 text-right">Perdida</th>
                  <th className="pb-2 text-right">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {perdaPorFase.map((p, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td className="py-1.5 text-neutral-700">{faseMudaLabels[p.fase]}</td>
                    <td className="py-1.5 text-right text-neutral-700">{p.quantidadePerdida}</td>
                    <td className="py-1.5 text-right text-neutral-700">{p.taxaPerda.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-neutral-200 font-medium">
                  <td className="py-1.5 text-neutral-800">Total do ciclo</td>
                  <td className="py-1.5 text-right text-neutral-800">
                    {perdaPorFase.reduce((s, p) => s + p.quantidadePerdida, 0)}
                  </td>
                  <td className="py-1.5 text-right text-neutral-800">{perdaTotal.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Timeline de Fases
            </h2>
            {lote.faseEventos.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhum evento registrado ainda.</p>
            ) : (
              <ul className="space-y-3">
                {lote.faseEventos.map((event) => (
                  <li key={event.id} className="flex items-start justify-between text-sm">
                    <div>
                      <p className="font-medium text-neutral-800">{faseMudaLabels[event.fase]}</p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(event.dataEntrada)}
                        {event.dataSaida ? ` → ${formatDate(event.dataSaida)}` : " (em andamento)"}
                      </p>
                      {!!event.quantidadePerdida && (
                        <p className="text-xs text-red-600">Perda: {event.quantidadePerdida}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "insumos",
              label: "Insumos",
              content: (
                <InsumosSection
                  loteId={id}
                  insumos={lote.insumos}
                  stockItems={stockItems.map((s) => ({
                    id: s.id,
                    code: s.code,
                    name: s.name,
                    currentQuantity: String(s.currentQuantity),
                    unit: s.unit,
                  }))}
                />
              ),
            },
            {
              id: "irrigacao",
              label: "Irrigação",
              content: (
                <IrrigacaoSection loteId={id} irrigacoes={lote.irrigacoes} employees={employees} />
              ),
            },
            {
              id: "fitossanidade",
              label: "Fitossanidade",
              content: (
                <FitossanidadeSection
                  loteId={id}
                  eventos={lote.fitossanidades}
                  employees={employees}
                />
              ),
            },
            {
              id: "mao-de-obra",
              label: "Mão de Obra",
              content: (
                <MaoDeObraSection loteId={id} apontamentos={lote.maoDeObra} employees={employees} />
              ),
            },
            {
              id: "certificados",
              label: "Certificados",
              content: <CertificadosSection loteId={id} certificados={lote.certificados} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
