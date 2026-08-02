import Link from "next/link";
import { Plus } from "lucide-react";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { mudaPedidoVendaStatusLabels, formatCurrency, formatDate } from "@/lib/labels";
import { requireModule } from "@/lib/tenant";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  CONFIRMADO: "bg-blue-50 text-blue-700",
  ENTREGUE: "bg-green-50 text-green-700",
  CANCELADO: "bg-red-50 text-red-700",
};

export default async function MudaPedidosVendaListPage() {
  const { organizationId, organization } = await requireModule("viveiro");
  const locale = await getLocale();
  const pedidos = await prisma.mudaPedidoVenda.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { cliente: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pedidos de Venda</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {pedidos.length} {pedidos.length === 1 ? "pedido cadastrado" : "pedidos cadastrados"}
          </p>
        </div>
        <Link
          href="/viveiro/pedidos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Pedido
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Valor Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum pedido cadastrado ainda.
                </td>
              </tr>
            )}
            {pedidos.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/viveiro/pedidos/${p.id}`} className="font-medium text-brand-800 hover:underline">
                    {p.numero}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{p.cliente.name}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(p.dataPedido)}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatCurrency(p.valorTotal, locale, organization.currency)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[p.status]}`}>
                    {mudaPedidoVendaStatusLabels[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
