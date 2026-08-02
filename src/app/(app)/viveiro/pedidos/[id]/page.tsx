import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { mudaPedidoVendaFields } from "../fields";
import {
  updateMudaPedidoVendaAction,
  deleteMudaPedidoVendaAction,
  addMudaPedidoVendaItemAction,
  deleteMudaPedidoVendaItemAction,
  cancelMudaPedidoVendaAction,
  markMudaPedidoVendaEntregueAction,
} from "../actions";
import { ConfirmButton } from "./confirm-button";
import { mudaPedidoVendaStatusLabels, formatCurrency } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";

export default async function MudaPedidoVendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId, organization } = await requireModule("viveiro");
  const locale = await getLocale();

  const pedido = await prisma.mudaPedidoVenda.findFirst({
    where: { id, organizationId },
    include: { cliente: true, itens: { include: { lote: true } } },
  });
  if (!pedido) notFound();

  const [clientes, lotesDisponiveis] = await Promise.all([
    prisma.client.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    // Espelha loteDisponivelParaVenda (src/lib/muda-lote.ts): fase PRONTA_EXPEDICAO e
    // quantidade > 0 — só esses lotes podem virar item de pedido.
    prisma.mudaLote.findMany({
      where: { organizationId, faseAtual: "PRONTA_EXPEDICAO", quantidadeAtual: { gt: 0 } },
      orderBy: { code: "asc" },
    }),
  ]);

  const podeEditarItens = pedido.status === "PENDENTE";

  return (
    <div>
      <Link href="/viveiro/pedidos" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Pedidos de Venda
      </Link>
      <div className="mt-1 mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Pedido {pedido.numero}</h1>
        {pedido.status === "PENDENTE" && (
          <DeleteButton onDelete={deleteMudaPedidoVendaAction.bind(null, id)} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={mudaPedidoVendaFields}
          action={updateMudaPedidoVendaAction.bind(null, id)}
          initialValues={pedido}
          relationOptions={{
            clienteId: clientes.map((c) => ({ id: c.id, label: c.name })),
          }}
          backHref="/viveiro/pedidos"
        />

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Status</h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
                {mudaPedidoVendaStatusLabels[pedido.status]}
              </span>
            </div>
            <p className="mb-3 text-sm text-neutral-600">
              Valor total: <strong>{formatCurrency(pedido.valorTotal, locale, organization.currency)}</strong>
            </p>
            <div className="flex flex-wrap items-start gap-2">
              {pedido.status === "PENDENTE" && <ConfirmButton pedidoId={id} />}
              {pedido.status === "CONFIRMADO" && (
                <form action={markMudaPedidoVendaEntregueAction.bind(null, id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
                  >
                    Marcar como Entregue
                  </button>
                </form>
              )}
              {(pedido.status === "PENDENTE" || pedido.status === "CONFIRMADO") && (
                <form action={cancelMudaPedidoVendaAction.bind(null, id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Cancelar Pedido
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Itens do Pedido
            </h2>

            {pedido.itens.length === 0 ? (
              <p className="mb-4 text-sm text-neutral-400">Nenhum item adicionado ainda.</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {pedido.itens.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-neutral-800">
                        Lote {item.lote.code} — {item.quantidade} mudas
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatCurrency(item.precoUnitario, locale, organization.currency)}/muda — subtotal:{" "}
                        {formatCurrency(item.quantidade * Number(item.precoUnitario), locale, organization.currency)}
                      </p>
                    </div>
                    {podeEditarItens && (
                      <DeleteButton
                        onDelete={deleteMudaPedidoVendaItemAction.bind(null, id, item.id)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {podeEditarItens ? (
              <form
                action={addMudaPedidoVendaItemAction.bind(null, id)}
                className="space-y-2 border-t border-neutral-100 pt-4"
              >
                <select
                  name="loteId"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
                >
                  <option value="">Selecione o lote (só disponíveis pra venda)</option>
                  {lotesDisponiveis.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} ({l.quantidadeAtual} disponíveis)
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="quantidade"
                    min={1}
                    placeholder="Quantidade"
                    required
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
                  />
                  <input
                    type="number"
                    step="0.01"
                    name="precoUnitario"
                    placeholder="Preço unitário"
                    required
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
                >
                  Adicionar Item
                </button>
              </form>
            ) : (
              <p className="border-t border-neutral-100 pt-4 text-xs text-neutral-400">
                Itens só podem ser adicionados/removidos enquanto o pedido está pendente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
