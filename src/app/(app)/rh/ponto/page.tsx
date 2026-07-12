import Link from "next/link";
import { Plus, Pencil, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { attendanceStatusLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteAttendanceAction } from "./actions";

const statusColor: Record<string, string> = {
  PRESENTE: "bg-green-50 text-green-700",
  FALTA: "bg-red-50 text-red-700",
  ATESTADO: "bg-amber-50 text-amber-700",
  FERIAS: "bg-blue-50 text-blue-700",
  FOLGA: "bg-neutral-100 text-neutral-500",
};

export default async function AttendanceListPage() {
  const records = await prisma.attendance.findMany({
    orderBy: { date: "desc" },
    include: { employee: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Ponto e Escalas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {records.length} {records.length === 1 ? "registro de ponto" : "registros de ponto"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/rh/ponto/escalas"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <CalendarClock size={16} />
            Escalas
          </Link>
          <Link
            href="/rh/ponto/novo"
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            Novo Registro
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Funcionário</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Horas</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum registro de ponto cadastrado ainda.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.employee.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                    {attendanceStatusLabels[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {r.hoursWorked ? `${r.hoursWorked} h` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/rh/ponto/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteAttendanceAction.bind(null, r.id)} />
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
