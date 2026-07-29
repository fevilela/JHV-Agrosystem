import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { propagacaoTipoLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteMudaEspecieAction } from "./actions";

export default async function MudaEspeciesListPage() {
  const { organizationId } = await requireModule("viveiro");
  const especies = await prisma.mudaEspecie.findMany({
    where: { organizationId },
    orderBy: { nomePopular: "asc" },
    include: { fornecedor: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Espécies e Cultivares</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {especies.length} {especies.length === 1 ? "espécie cadastrada" : "espécies cadastradas"}
          </p>
        </div>
        <Link
          href="/viveiro/especies/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Espécie
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Nome Popular</th>
              <th className="px-4 py-3">Nome Científico</th>
              <th className="px-4 py-3">Cultivar</th>
              <th className="px-4 py-3">Propagação</th>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {especies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma espécie cadastrada ainda.
                </td>
              </tr>
            )}
            {especies.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{e.nomePopular}</td>
                <td className="px-4 py-3 text-neutral-700">{e.nomeCientifico || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{e.cultivar || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{propagacaoTipoLabels[e.tipoPropagacao]}</td>
                <td className="px-4 py-3 text-neutral-700">{e.fornecedor?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/viveiro/especies/${e.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMudaEspecieAction.bind(null, e.id)} />
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
