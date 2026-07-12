import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tratoCulturalTypeLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTratoAction } from "./actions";

export default async function TratosCulturaisListPage() {
  const tratos = await prisma.tratoCultural.findMany({
    orderBy: { date: "desc" },
    include: { safra: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Tratos Culturais</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {tratos.length} {tratos.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Link
          href="/agricultura/tratos-culturais/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Registro
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Safra</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Dose</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tratos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum registro cadastrado ainda.
                </td>
              </tr>
            )}
            {tratos.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(t.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{t.safra.name}</td>
                <td className="px-4 py-3 text-neutral-700">{tratoCulturalTypeLabels[t.type]}</td>
                <td className="px-4 py-3 text-neutral-700">{t.product || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{t.dose || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/tratos-culturais/${t.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTratoAction.bind(null, t.id)} />
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
