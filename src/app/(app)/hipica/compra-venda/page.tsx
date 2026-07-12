import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { animalTransactionTypeLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTransactionAction } from "./actions";

const typeColor: Record<string, string> = {
  COMPRA: "bg-blue-50 text-blue-700",
  VENDA: "bg-green-50 text-green-700",
  LEILAO: "bg-amber-50 text-amber-700",
};

export default async function CompraVendaListPage() {
  const transactions = await prisma.animalTransaction.findMany({
    orderBy: { date: "desc" },
    include: { animal: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Compra e Venda de Animais</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {transactions.length} {transactions.length === 1 ? "transação registrada" : "transações registradas"}
          </p>
        </div>
        <Link
          href="/hipica/compra-venda/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Transação
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Comissão</th>
              <th className="px-4 py-3">Contraparte</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma transação registrada ainda.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(t.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{t.animal.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[t.type]}`}>
                    {animalTransactionTypeLabels[t.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(t.value)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(t.commission)}</td>
                <td className="px-4 py-3 text-neutral-700">{t.counterpartyName || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/hipica/compra-venda/${t.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTransactionAction.bind(null, t.id)} />
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
