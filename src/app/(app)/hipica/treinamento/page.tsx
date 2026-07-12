import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { exerciseTypeLabels, intensityLabels, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTrainingAction } from "./actions";

export default async function TreinamentoListPage() {
  const sessions = await prisma.trainingSession.findMany({
    orderBy: { date: "desc" },
    include: { animal: true, instructor: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Treinamento / Controle Diário
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {sessions.length}{" "}
            {sessions.length === 1 ? "sessão registrada" : "sessões registradas"}
          </p>
        </div>
        <Link
          href="/hipica/treinamento/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Sessão
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Animal</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Tempo</th>
              <th className="px-4 py-3">Intensidade</th>
              <th className="px-4 py-3">Instrutor</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Nenhuma sessão registrada ainda.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(s.date)}</td>
                <td className="px-4 py-3 text-neutral-700">{s.animal.name}</td>
                <td className="px-4 py-3 text-neutral-700">{exerciseTypeLabels[s.exerciseType]}</td>
                <td className="px-4 py-3 text-neutral-700">{s.durationMin ? `${s.durationMin} min` : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{s.intensity ? intensityLabels[s.intensity] : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{s.instructor?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/hipica/treinamento/${s.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTrainingAction.bind(null, s.id)} />
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
