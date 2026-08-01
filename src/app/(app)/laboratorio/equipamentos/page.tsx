import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { equipamentoStatusLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteEquipamentoAction } from "./actions";

const statusColor: Record<string, string> = {
  EM_USO: "bg-green-50 text-green-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
  FORA_OPERACAO: "bg-red-50 text-red-700",
};

export default async function EquipamentosListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const equipamentos = await prisma.equipamento.findMany({
    where: { organizationId },
    orderBy: { nome: "asc" },
  });

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Equipamentos e Calibração</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {equipamentos.length} {equipamentos.length === 1 ? "equipamento cadastrado" : "equipamentos cadastrados"}
          </p>
        </div>
        <Link
          href="/laboratorio/equipamentos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Equipamento
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Nº Série</th>
              <th className="px-4 py-3">Próxima Calibração</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum equipamento cadastrado ainda.
                </td>
              </tr>
            )}
            {equipamentos.map((eq) => {
              const vencida = eq.dataProximaCalibracao && new Date(eq.dataProximaCalibracao) < now;
              const vencendo =
                eq.dataProximaCalibracao &&
                !vencida &&
                new Date(eq.dataProximaCalibracao) <= in30;
              return (
                <tr key={eq.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/laboratorio/equipamentos/${eq.id}`}
                      className="font-medium text-brand-800 hover:underline"
                    >
                      {eq.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{eq.numeroSerie || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        vencida
                          ? "font-medium text-red-600"
                          : vencendo
                            ? "font-medium text-amber-600"
                            : "text-neutral-700"
                      }
                    >
                      {formatDate(eq.dataProximaCalibracao)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[eq.status]}`}>
                      {equipamentoStatusLabels[eq.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/laboratorio/equipamentos/${eq.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteEquipamentoAction.bind(null, eq.id)} />
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
