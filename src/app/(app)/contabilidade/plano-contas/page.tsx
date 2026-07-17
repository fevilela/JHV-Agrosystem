import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { chartAccountTypeLabels, chartAccountNatureLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteChartAccountAction } from "./actions";

export default async function ChartAccountListPage() {
  const accounts = await prisma.chartAccount.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Plano de Contas</h1>
          <p className="mt-1 text-sm text-neutral-500">{accounts.length} contas</p>
        </div>
        <Link
          href="/contabilidade/plano-contas/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Conta
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Natureza</th>
              <th className="px-4 py-3">Analítica</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma conta cadastrada ainda.
                </td>
              </tr>
            )}
            {accounts.map((a) => {
              const depth = a.code.split(".").length - 1;
              return (
                <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-neutral-700">{a.code}</td>
                  <td className="px-4 py-3 text-neutral-700" style={{ paddingLeft: `${depth * 16 + 16}px` }}>
                    {a.analytic ? a.name : <span className="font-semibold">{a.name}</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{chartAccountTypeLabels[a.type]}</td>
                  <td className="px-4 py-3 text-neutral-700">{chartAccountNatureLabels[a.nature]}</td>
                  <td className="px-4 py-3 text-neutral-700">{a.analytic ? "Sim" : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {a.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/contabilidade/plano-contas/${a.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteChartAccountAction.bind(null, a.id)} />
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
