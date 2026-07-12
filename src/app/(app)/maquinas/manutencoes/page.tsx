import Link from "next/link";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { maintenanceTypeLabels, machineTypeLabels, formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMaintenanceAction } from "./actions";

export default async function MaintenanceListPage() {
  const maintenances = await prisma.maintenance.findMany({
    orderBy: { date: "desc" },
    include: { machine: true },
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Manutenções</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {maintenances.length} {maintenances.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Link
          href="/maquinas/manutencoes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Manutenção
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Máquina</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Custo</th>
              <th className="px-4 py-3">Próxima</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma manutenção cadastrada ainda.
                </td>
              </tr>
            )}
            {maintenances.map((m) => {
              const overdue = m.nextDueDate && new Date(m.nextDueDate) < now;
              const upcoming = m.nextDueDate && !overdue && new Date(m.nextDueDate) <= soon;
              return (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{formatDate(m.date)}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {machineTypeLabels[m.machine.type]}
                    {m.machine.plateOrSerial && (
                      <span className="block text-xs text-neutral-400">{m.machine.plateOrSerial}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{maintenanceTypeLabels[m.type]}</td>
                  <td className="px-4 py-3 text-neutral-700">{m.description || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(m.cost)}</td>
                  <td className="px-4 py-3">
                    {m.nextDueDate ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          overdue
                            ? "bg-red-50 text-red-700"
                            : upcoming
                              ? "bg-amber-50 text-amber-700"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {(overdue || upcoming) && <AlertTriangle size={12} />}
                        {formatDate(m.nextDueDate)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/maquinas/manutencoes/${m.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteMaintenanceAction.bind(null, m.id)} />
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
