import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  financialEntryTypeLabels,
  financialEntryStatusLabels,
  formatCurrency,
  formatDate,
} from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteFinancialAction, markFinancialPaidAction } from "./actions";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  PAGO: "bg-green-50 text-green-700",
  ATRASADO: "bg-red-50 text-red-700",
  CANCELADO: "bg-neutral-100 text-neutral-500",
};

export default async function FinanceiroListPage() {
  const { organizationId } = await requireModule("hipica");
  const entries = await prisma.financialEntry.findMany({
    where: { organizationId },
    orderBy: { dueDate: "asc" },
    include: { animal: true, client: true },
  });

  const totalPendente = entries
    .filter((e) => e.status === "PENDENTE" || e.status === "ATRASADO")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Financeiro da Hípica</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {entries.length} lançamentos · {formatCurrency(totalPendente)} em aberto
          </p>
        </div>
        <Link
          href="/hipica/financeiro/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Lançamento
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum lançamento cadastrado ainda.
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(e.dueDate)}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {e.description}
                  {(e.animal || e.client) && (
                    <span className="block text-xs text-neutral-400">
                      {e.animal?.name}
                      {e.animal && e.client ? " · " : ""}
                      {e.client?.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700">{financialEntryTypeLabels[e.type]}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[e.status]}`}>
                    {financialEntryStatusLabels[e.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {e.status !== "PAGO" && (
                      <form action={markFinancialPaidAction.bind(null, e.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                        >
                          Marcar pago
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/hipica/financeiro/${e.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteFinancialAction.bind(null, e.id)} />
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
