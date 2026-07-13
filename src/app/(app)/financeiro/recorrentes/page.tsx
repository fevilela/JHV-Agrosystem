import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteRecurringBillingAction } from "./actions";

export default async function RecurringBillingListPage() {
  const templates = await prisma.recurringBilling.findMany({
    orderBy: { dayOfMonth: "asc" },
    include: { client: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Cobranças Recorrentes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {templates.length} {templates.length === 1 ? "cobrança" : "cobranças"}
          </p>
        </div>
        <Link
          href="/financeiro/recorrentes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Cobrança Recorrente
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        Todo dia do mês configurado abaixo, o sistema cria automaticamente a conta a receber e
        gera o boleto para o cliente.
      </p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Dia</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma cobrança recorrente cadastrada ainda.
                </td>
              </tr>
            )}
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">Dia {t.dayOfMonth}</td>
                <td className="px-4 py-3 text-neutral-700">{t.client.name}</td>
                <td className="px-4 py-3 text-neutral-700">{t.description}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(t.amount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {t.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/financeiro/recorrentes/${t.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteRecurringBillingAction.bind(null, t.id)} />
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
