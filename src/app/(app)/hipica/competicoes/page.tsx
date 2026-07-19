import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteCompetitionAction } from "./actions";

export default async function CompeticoesListPage() {
  const { organizationId } = await requireModule("hipica");
  const competitions = await prisma.competition.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    include: { animal: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Competições</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {competitions.length}{" "}
            {competitions.length === 1 ? "participação registrada" : "participações registradas"}
          </p>
        </div>
        <Link
          href="/hipica/competicoes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Participação
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Competição</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Resultado</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {competitions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma participação registrada ainda.
                </td>
              </tr>
            )}
            {competitions.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(c.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{c.name}</td>
                <td className="px-4 py-3 text-neutral-700">{c.animal.name}</td>
                <td className="px-4 py-3 text-neutral-700">{c.category || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{c.result || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/hipica/competicoes/${c.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteCompetitionAction.bind(null, c.id)} />
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
