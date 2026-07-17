import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteJournalEntryAction } from "./actions";

export default async function JournalEntryListPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { date: "desc" },
    include: { lines: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Lançamentos Contábeis</h1>
          <p className="mt-1 text-sm text-neutral-500">{entries.length} lançamentos</p>
        </div>
        <Link
          href="/contabilidade/lancamentos/novo"
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
              <th className="px-4 py-3">Nº</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Partidas</th>
              <th className="px-4 py-3">Valor</th>
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
            {entries.map((e) => {
              const total = e.lines
                .filter((l) => l.type === "DEBITO")
                .reduce((sum, l) => sum + Number(l.amount), 0);
              return (
                <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{e.number}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-neutral-700">{e.description}</td>
                  <td className="px-4 py-3 text-neutral-700">{e.lines.length}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/contabilidade/lancamentos/${e.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteJournalEntryAction.bind(null, e.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
