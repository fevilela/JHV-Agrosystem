import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { pedidoAnaliseFields } from "../fields";
import {
  updatePedidoAnaliseAction,
  updateStatusFinanceiroAction,
  addItemPedidoAction,
  deleteItemPedidoAction,
} from "../actions";
import { pedidoAnaliseStatusFinanceiroLabels, formatCurrency } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";

export default async function PedidoAnaliseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId, organization } = await requireModule("laboratorio");
  const locale = await getLocale();

  const pedido = await prisma.pedidoAnalise.findFirst({
    where: { id, organizationId },
    include: { produtor: true, itens: { include: { amostra: true } } },
  });
  if (!pedido) notFound();

  const [produtores, amostras] = await Promise.all([
    prisma.produtor.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.amostra.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-brand-600";

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Pedido {pedido.numero}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={pedidoAnaliseFields}
          action={updatePedidoAnaliseAction.bind(null, id)}
          initialValues={pedido}
          relationOptions={{
            produtorId: produtores.map((p) => ({ id: p.id, label: p.name })),
          }}
          backHref="/laboratorio/pedidos"
        />

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Status Financeiro
              </h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
                {pedidoAnaliseStatusFinanceiroLabels[pedido.statusFinanceiro]}
              </span>
            </div>
            <p className="mb-3 text-sm text-neutral-600">
              Valor total: <strong>{formatCurrency(pedido.valorTotal, locale, organization.currency)}</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {(["PENDENTE", "PAGO", "VENCIDO"] as const)
                .filter((s) => s !== pedido.statusFinanceiro)
                .map((s) => (
                  <form key={s} action={updateStatusFinanceiroAction.bind(null, id, s)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Marcar como {pedidoAnaliseStatusFinanceiroLabels[s]}
                    </button>
                  </form>
                ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Análises Solicitadas
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
                      <p className="font-medium text-neutral-800">{item.descricao}</p>
                      <p className="text-xs text-neutral-500">
                        {item.amostra ? `Amostra ${item.amostra.code}` : "Sem amostra vinculada"}
                        {item.valor !== null ? ` · ${formatCurrency(item.valor, locale, organization.currency)}` : ""}
                      </p>
                    </div>
                    <DeleteButton onDelete={deleteItemPedidoAction.bind(null, id, item.id)} />
                  </li>
                ))}
              </ul>
            )}

            <form action={addItemPedidoAction.bind(null, id)} className="space-y-2 border-t border-neutral-100 pt-4">
              <input name="descricao" placeholder="Descrição (análise/pacote)" required className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input name="valor" type="number" step="0.01" placeholder="Valor" className={inputClass} />
                <select name="amostraId" className={inputClass}>
                  <option value="">Amostra (opcional)</option>
                  {amostras.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code}
                    </option>
                  ))}
                </select>
              </div>
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
    </div>
  );
}
