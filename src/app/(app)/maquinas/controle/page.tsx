import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { machineTypeLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteUsageLogAction } from "./actions";

export default async function UsageLogListPage() {
  const logs = await prisma.usageLog.findMany({
    orderBy: { date: "desc" },
    include: { machine: true, talhao: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Controle de Uso</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {logs.length} {logs.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Link
          href="/maquinas/controle/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Registro
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Máquina</th>
              <th className="px-4 py-3">Horímetro</th>
              <th className="px-4 py-3">Combustível</th>
              <th className="px-4 py-3">Operador</th>
              <th className="px-4 py-3">Talhão</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum registro cadastrado ainda.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(l.date)}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {machineTypeLabels[l.machine.type]}
                  {l.machine.plateOrSerial && (
                    <span className="block text-xs text-neutral-400">{l.machine.plateOrSerial}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700">{String(l.horimetro)} h</td>
                <td className="px-4 py-3 text-neutral-700">
                  {l.combustivelLitros ? `${l.combustivelLitros} L` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{l.operador || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{l.talhao?.code || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/maquinas/controle/${l.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteUsageLogAction.bind(null, l.id)} />
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
