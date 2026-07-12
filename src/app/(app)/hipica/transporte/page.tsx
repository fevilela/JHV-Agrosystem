import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTransportAction } from "./actions";

export default async function TransporteListPage() {
  const transports = await prisma.transport.findMany({
    orderBy: { date: "desc" },
    include: { animals: { include: { animal: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Transporte</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {transports.length} {transports.length === 1 ? "transporte registrado" : "transportes registrados"}
          </p>
        </div>
        <Link
          href="/hipica/transporte/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Transporte
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3">Motorista</th>
              <th className="px-4 py-3">Animais</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transports.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhum transporte registrado ainda.
                </td>
              </tr>
            )}
            {transports.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(t.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{t.origin || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{t.destination || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{t.driver || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {t.animals.map((a) => a.animal.name).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/hipica/transporte/${t.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTransportAction.bind(null, t.id)} />
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
