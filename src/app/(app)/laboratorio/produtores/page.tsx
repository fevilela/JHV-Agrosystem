import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { produtorTipoLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteProdutorAction } from "./actions";

export default async function ProdutoresListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const produtores = await prisma.produtor.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: { _count: { select: { propriedades: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Produtores</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {produtores.length} {produtores.length === 1 ? "produtor cadastrado" : "produtores cadastrados"}
          </p>
        </div>
        <Link
          href="/laboratorio/produtores/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Produtor
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">CPF/CNPJ</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Propriedades</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtores.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum produtor cadastrado ainda.
                </td>
              </tr>
            )}
            {produtores.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/laboratorio/produtores/${p.id}`}
                    className="font-medium text-brand-800 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{produtorTipoLabels[p.tipo]}</td>
                <td className="px-4 py-3 text-neutral-700">{p.cpfCnpj || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{p.phone || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{p._count.propriedades}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/laboratorio/produtores/${p.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteProdutorAction.bind(null, p.id)} />
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
