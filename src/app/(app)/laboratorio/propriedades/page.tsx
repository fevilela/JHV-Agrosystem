import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deletePropriedadeAction } from "./actions";

export default async function PropriedadesListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const propriedades = await prisma.propriedadeProdutor.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: { produtor: true, _count: { select: { talhoes: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Propriedades e Talhões</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {propriedades.length} {propriedades.length === 1 ? "propriedade cadastrada" : "propriedades cadastradas"}
          </p>
        </div>
        <Link
          href="/laboratorio/propriedades/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Propriedade
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Produtor</th>
              <th className="px-4 py-3">Área Total (ha)</th>
              <th className="px-4 py-3">Talhões</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {propriedades.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma propriedade cadastrada ainda.
                </td>
              </tr>
            )}
            {propriedades.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/laboratorio/propriedades/${p.id}`}
                    className="font-medium text-brand-800 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{p.produtor.name}</td>
                <td className="px-4 py-3 text-neutral-700">{p.areaTotalHa ? String(p.areaTotalHa) : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{p._count.talhoes}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/laboratorio/propriedades/${p.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deletePropriedadeAction.bind(null, p.id)} />
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
