import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { getEntityConfig } from "@/lib/entities";
import { listEntities } from "@/lib/crud";
import { requireOrg } from "@/lib/tenant";
import { deleteEntityAction } from "./actions";
import { DeleteButton } from "@/components/crud/delete-button";

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

export default async function EntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) notFound();

  const { organizationId } = await requireOrg();
  const rows = await listEntities(config, organizationId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            {config.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {rows.length}{" "}
            {rows.length === 1 ? "registro cadastrado" : "registros cadastrados"}
          </p>
        </div>
        <Link
          href={`/cadastro/${entity}/novo`}
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo {config.singular}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              {config.listColumns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={config.listColumns.length + 1}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  Nenhum registro cadastrado ainda.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id as string}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                {config.listColumns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-neutral-700">
                    {formatCell(row[col.key])}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/cadastro/${entity}/${row.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton
                      onDelete={deleteEntityAction.bind(
                        null,
                        entity,
                        row.id as string
                      )}
                    />
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
