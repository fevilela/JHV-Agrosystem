import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  naoConformidadeOrigemLabels,
  naoConformidadeSeveridadeLabels,
  naoConformidadeStatusLabels,
  formatDate,
} from "@/lib/labels";
import { isPrazoVencido } from "@/lib/nao-conformidade";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import { deleteNaoConformidadeAction } from "./actions";
import type { NaoConformidadeOrigem, NaoConformidadeSeveridade, NaoConformidadeStatus } from "@prisma/client";

const severidadeColor: Record<string, string> = {
  CRITICA: "bg-red-50 text-red-700",
  MAIOR: "bg-amber-50 text-amber-700",
  MENOR: "bg-neutral-100 text-neutral-600",
};

const statusColor: Record<string, string> = {
  ABERTA: "bg-red-50 text-red-700",
  EM_TRATATIVA: "bg-amber-50 text-amber-700",
  RESOLVIDA: "bg-green-50 text-green-700",
};

export default async function NaoConformidadesListPage({
  searchParams,
}: {
  searchParams: Promise<{ origem?: string; severidade?: string; status?: string }>;
}) {
  const { organizationId } = await requireModule("auditoria");
  const { origem, severidade, status } = await searchParams;

  const naoConformidades = await prisma.naoConformidade.findMany({
    where: {
      organizationId,
      ...(origem ? { origem: origem as NaoConformidadeOrigem } : {}),
      ...(severidade ? { severidade: severidade as NaoConformidadeSeveridade } : {}),
      ...(status ? { status: status as NaoConformidadeStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Não Conformidades</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {naoConformidades.length}{" "}
            {naoConformidades.length === 1 ? "não conformidade encontrada" : "não conformidades encontradas"}
          </p>
        </div>
        <Link
          href="/auditoria/nao-conformidades/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Não Conformidade
        </Link>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Origem</label>
          <select
            name="origem"
            defaultValue={origem ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todas</option>
            {Object.entries(naoConformidadeOrigemLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Severidade</label>
          <select
            name="severidade"
            defaultValue={severidade ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todas</option>
            {Object.entries(naoConformidadeSeveridadeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Status</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todos</option>
            {Object.entries(naoConformidadeStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Severidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Reincidente</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {naoConformidades.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma não conformidade encontrada.
                </td>
              </tr>
            )}
            {naoConformidades.map((nc) => (
              <tr key={nc.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{nc.descricao}</td>
                <td className="px-4 py-3 text-neutral-700">{naoConformidadeOrigemLabels[nc.origem]}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${severidadeColor[nc.severidade]}`}
                  >
                    {naoConformidadeSeveridadeLabels[nc.severidade]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[nc.status]}`}>
                    {naoConformidadeStatusLabels[nc.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={isPrazoVencido(nc.prazoResolucao, nc.status, now) ? "font-medium text-red-600" : "text-neutral-700"}>
                    {formatDate(nc.prazoResolucao)}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{nc.reincidente ? "Sim" : "Não"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/auditoria/nao-conformidades/${nc.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteNaoConformidadeAction.bind(null, nc.id)} />
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
