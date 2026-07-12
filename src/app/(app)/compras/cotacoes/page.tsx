import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { quotationStatusLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteQuotationAction } from "./actions";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  APROVADA: "bg-green-50 text-green-700",
  RECUSADA: "bg-red-50 text-red-700",
};

export default async function QuotationListPage() {
  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: true, purchaseRequest: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Cotações</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {quotations.length} {quotations.length === 1 ? "cotação" : "cotações"}
          </p>
        </div>
        <Link
          href="/compras/cotacoes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Cotação
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Solicitação</th>
              <th className="px-4 py-3">Valor Total</th>
              <th className="px-4 py-3">Válida até</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma cotação cadastrada ainda.
                </td>
              </tr>
            )}
            {quotations.map((q) => (
              <tr key={q.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{q.supplier.name}</td>
                <td className="px-4 py-3 text-neutral-700">{q.description || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{q.purchaseRequest?.description || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(q.totalValue)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(q.validUntil)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[q.status]}`}>
                    {quotationStatusLabels[q.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/compras/cotacoes/${q.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteQuotationAction.bind(null, q.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
