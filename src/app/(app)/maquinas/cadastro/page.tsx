import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { machineTypeLabels, machineStatusLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMachineAction } from "./actions";

const statusColor: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
  INATIVO: "bg-neutral-100 text-neutral-500",
  VENDIDO: "bg-blue-50 text-blue-700",
};

export default async function MachineListPage() {
  const machines = await prisma.machine.findMany({
    orderBy: [{ type: "asc" }, { brand: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Máquinas e Equipamentos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {machines.length} {machines.length === 1 ? "máquina cadastrada" : "máquinas cadastradas"}
          </p>
        </div>
        <Link
          href="/maquinas/cadastro/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Máquina
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Marca/Modelo</th>
              <th className="px-4 py-3">Placa/Série</th>
              <th className="px-4 py-3">Ano</th>
              <th className="px-4 py-3">Horímetro</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {machines.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma máquina cadastrada ainda.
                </td>
              </tr>
            )}
            {machines.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{machineTypeLabels[m.type]}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {[m.brand, m.model].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{m.plateOrSerial || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{m.year ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {m.horimetroAtual ? `${m.horimetroAtual} h` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[m.status]}`}>
                    {machineStatusLabels[m.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/maquinas/cadastro/${m.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMachineAction.bind(null, m.id)} />
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
