import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteNormaReferenciaAction } from "./actions";

export default async function NormasReferenciaListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const normas = await prisma.normaReferencia.findMany({
    where: { organizationId },
    orderBy: { nome: "asc" },
    include: { metodoAnalitico: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Normas de Referência</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {normas.length} {normas.length === 1 ? "norma cadastrada" : "normas cadastradas"}
          </p>
        </div>
        <Link
          href="/laboratorio/normas/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Norma
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Norma</th>
              <th className="px-4 py-3">Parâmetro</th>
              <th className="px-4 py-3">Limite Legal</th>
              <th className="px-4 py-3">Vigência</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {normas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma norma cadastrada ainda.
                </td>
              </tr>
            )}
            {normas.map((n) => (
              <tr key={n.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{n.nome}</td>
                <td className="px-4 py-3 text-neutral-700">{n.metodoAnalitico?.nomeParametro || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{n.limiteLegal || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(n.dataVigencia)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/laboratorio/normas/${n.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteNormaReferenciaAction.bind(null, n.id)} />
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
