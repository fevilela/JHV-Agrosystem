import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteAcreditacaoAction, toggleParametroAcreditadoAction } from "./actions";

export default async function AcreditacaoListPage() {
  const { organizationId } = await requireModule("laboratorio");
  const [acreditacoes, metodos] = await Promise.all([
    prisma.acreditacaoLaboratorio.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
    prisma.metodoAnalitico.findMany({ where: { organizationId }, orderBy: { nomeParametro: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Acreditação do Laboratório</h1>
          <p className="mt-1 text-sm text-neutral-500">Escopo institucional (ex: ISO/IEC 17025)</p>
        </div>
        <Link
          href="/laboratorio/acreditacao/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Registro
        </Link>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Escopo</th>
              <th className="px-4 py-3">Órgão Acreditador</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {acreditacoes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum registro de acreditação ainda.
                </td>
              </tr>
            )}
            {acreditacoes.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/laboratorio/acreditacao/${a.id}`} className="font-medium text-brand-800 hover:underline">
                    {a.escopoAcreditacao || "Sem escopo definido"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{a.orgaoAcreditador || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(a.dataValidade)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/laboratorio/acreditacao/${a.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteAcreditacaoAction.bind(null, a.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Parâmetros Acreditados x Não Acreditados
      </h2>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Parâmetro</th>
              <th className="px-4 py-3">Acreditado</th>
            </tr>
          </thead>
          <tbody>
            {metodos.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum método analítico cadastrado ainda.
                </td>
              </tr>
            )}
            {metodos.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{m.nomeParametro}</td>
                <td className="px-4 py-3">
                  <form action={toggleParametroAcreditadoAction.bind(null, m.id, !m.acreditado)}>
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        m.acreditado
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {m.acreditado ? "Acreditado" : "Não acreditado"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
