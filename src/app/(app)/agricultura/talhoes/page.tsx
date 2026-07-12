import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTalhaoAction } from "./actions";

export default async function TalhoesListPage() {
  const talhoes = await prisma.talhao.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { safras: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Talhões</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {talhoes.length} {talhoes.length === 1 ? "talhão cadastrado" : "talhões cadastrados"}
          </p>
        </div>
        <Link
          href="/agricultura/talhoes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Talhão
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Solo</th>
              <th className="px-4 py-3">Safras</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {talhoes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum talhão cadastrado ainda.
                </td>
              </tr>
            )}
            {talhoes.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{t.code}</td>
                <td className="px-4 py-3 text-neutral-700">{t.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {t.areaHectares ? `${t.areaHectares} ha` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{t.soilType || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{t._count.safras}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/talhoes/${t.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTalhaoAction.bind(null, t.id)} />
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
