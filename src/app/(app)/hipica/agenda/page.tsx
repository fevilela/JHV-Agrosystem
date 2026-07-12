import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  agendaEventTypeLabels,
  agendaEventStatusLabels,
  formatDate,
} from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteAgendaAction, setAgendaStatusAction } from "./actions";

const statusColor: Record<string, string> = {
  AGENDADO: "bg-blue-50 text-blue-700",
  CONCLUIDO: "bg-green-50 text-green-700",
  CANCELADO: "bg-neutral-100 text-neutral-500",
};

export default async function AgendaListPage() {
  const events = await prisma.agendaEvent.findMany({
    orderBy: { date: "asc" },
    include: { animal: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Agenda</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {events.length} {events.length === 1 ? "evento cadastrado" : "eventos cadastrados"}
          </p>
        </div>
        <Link
          href="/hipica/agenda/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Evento
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum evento cadastrado ainda.
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(e.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{e.title}</td>
                <td className="px-4 py-3 text-neutral-700">{agendaEventTypeLabels[e.type]}</td>
                <td className="px-4 py-3 text-neutral-700">{e.animal?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[e.status]}`}>
                    {agendaEventStatusLabels[e.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {e.status === "AGENDADO" && (
                      <>
                        <form action={setAgendaStatusAction.bind(null, e.id, "CONCLUIDO")}>
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                          >
                            Concluir
                          </button>
                        </form>
                        <form action={setAgendaStatusAction.bind(null, e.id, "CANCELADO")}>
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                          >
                            Cancelar
                          </button>
                        </form>
                      </>
                    )}
                    <Link
                      href={`/hipica/agenda/${e.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteAgendaAction.bind(null, e.id)} />
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
