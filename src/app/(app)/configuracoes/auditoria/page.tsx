import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";

const actionLabel: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Edição",
  DELETE: "Exclusão",
};

const actionColor: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700",
  UPDATE: "bg-amber-50 text-amber-700",
  DELETE: "bg-red-50 text-red-700",
};

type ChangeEntry = { field: string; before: unknown; after: unknown };

function formatValue(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string }>;
}) {
  const { organizationId, role } = await requireOrg();
  if (role !== "ADMIN") redirect("/");

  const { action, entityType } = await searchParams;

  const logs = await prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(action ? { action: action as "CREATE" | "UPDATE" | "DELETE" } : {}),
      ...(entityType ? { entityType } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const entityTypes = await prisma.auditLog.findMany({
    where: { organizationId },
    distinct: ["entityType"],
    select: { entityType: true },
    orderBy: { entityType: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Log de Auditoria</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        {logs.length} registro(s) — últimas alterações feitas nos dados da organização.
      </p>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Ação</label>
          <select
            name="action"
            defaultValue={action ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todas</option>
            <option value="CREATE">Criação</option>
            <option value="UPDATE">Edição</option>
            <option value="DELETE">Exclusão</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Módulo</label>
          <select
            name="entityType"
            defaultValue={entityType ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todos</option>
            {entityTypes.map((e) => (
              <option key={e.entityType} value={e.entityType}>
                {e.entityType}
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
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3">Alterações</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum registro de auditoria ainda.
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const changes = (log.changes as ChangeEntry[] | null) ?? [];
              return (
                <tr key={log.id} className="border-b border-neutral-100 last:border-0 align-top hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                    {formatDate(log.createdAt)}{" "}
                    <span className="text-xs text-neutral-400">
                      {new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{log.userName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColor[log.action]}`}>
                      {actionLabel[log.action]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{log.entityType}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {changes.length === 0 ? (
                      "—"
                    ) : (
                      <ul className="space-y-0.5">
                        {changes.slice(0, 5).map((c, i) => (
                          <li key={i} className="text-xs">
                            <strong>{c.field}</strong>: {formatValue(c.before)} → {formatValue(c.after)}
                          </li>
                        ))}
                        {changes.length > 5 && (
                          <li className="text-xs text-neutral-400">
                            +{changes.length - 5} campo(s)
                          </li>
                        )}
                      </ul>
                    )}
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
