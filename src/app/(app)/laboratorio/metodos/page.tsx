import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteMetodoAnaliticoAction } from "./actions";

export default async function MetodosAnaliticosListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const metodos = await prisma.metodoAnalitico.findMany({
    where: { organizationId },
    orderBy: { nomeParametro: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Métodos Analíticos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {metodos.length} {metodos.length === 1 ? "método cadastrado" : "métodos cadastrados"}
          </p>
        </div>
        <Link
          href="/laboratorio/metodos/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Método
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Parâmetro</th>
              <th className="px-4 py-3">Referência Normativa</th>
              <th className="px-4 py-3">Unidade</th>
              <th className="px-4 py-3">Faixa de Detecção</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {metodos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum método cadastrado ainda.
                </td>
              </tr>
            )}
            {metodos.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{m.nomeParametro}</td>
                <td className="px-4 py-3 text-neutral-700">{m.referenciaNormativa || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{m.unidadeMedida || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {m.faixaDeteccaoMin !== null && m.faixaDeteccaoMax !== null
                    ? `${m.faixaDeteccaoMin} – ${m.faixaDeteccaoMax}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{m.active ? "Sim" : "Não"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/laboratorio/metodos/${m.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMetodoAnaliticoAction.bind(null, m.id)} />
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
