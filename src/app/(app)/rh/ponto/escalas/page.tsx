import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { scheduleShiftLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteScheduleAction } from "../schedule-actions";

export default async function ScheduleListPage() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { startDate: "desc" },
    include: { employee: true },
  });

  return (
    <div>
      <Link href="/rh/ponto" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Ponto e Escalas
      </Link>
      <div className="mb-6 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Escalas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {schedules.length} {schedules.length === 1 ? "escala cadastrada" : "escalas cadastradas"}
          </p>
        </div>
        <Link
          href="/rh/ponto/escalas/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Escala
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Funcionário</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Fim</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma escala cadastrada ainda.
                </td>
              </tr>
            )}
            {schedules.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{s.employee.name}</td>
                <td className="px-4 py-3 text-neutral-700">{scheduleShiftLabels[s.shift]}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(s.startDate)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(s.endDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/rh/ponto/escalas/${s.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteScheduleAction.bind(null, s.id)} />
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
