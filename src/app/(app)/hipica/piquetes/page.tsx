import Link from "next/link";
import { Plus, Pencil, Map as MapIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { piqueteStatusLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { requireModule } from "@/lib/tenant";
import {
  deletePiqueteAction,
  occupyPiqueteAction,
  vacatePiqueteAction,
  markPiqueteStatusAction,
} from "./actions";

const statusColor: Record<string, string> = {
  LIVRE: "bg-neutral-100 text-neutral-600",
  OCUPADO: "bg-green-50 text-green-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
};

export default async function PiquetesListPage() {
  const { organizationId } = await requireModule("hipica");
  const [piquetes, animals] = await Promise.all([
    prisma.piquete.findMany({
      where: { organizationId },
      orderBy: { code: "asc" },
      include: { currentAnimal: true },
    }),
    prisma.animal.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Piquetes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {piquetes.length} {piquetes.length === 1 ? "piquete cadastrado" : "piquetes cadastrados"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/hipica/piquetes/mapa"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <MapIcon size={16} />
            Mapa
          </Link>
          <Link
            href="/hipica/piquetes/novo"
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            Novo Piquete
          </Link>
        </div>
      </div>

      {piquetes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhum piquete cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {piquetes.map((piquete) => (
            <div key={piquete.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900">{piquete.code}</h2>
                  <p className="text-xs text-neutral-500">
                    {piquete.location || "Localização não informada"}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[piquete.status]}`}>
                  {piqueteStatusLabels[piquete.status]}
                </span>
              </div>

              <div className="mt-3 text-sm text-neutral-600">
                {piquete.currentAnimal ? (
                  <Link
                    href={`/cadastro/animais/${piquete.currentAnimal.id}`}
                    className="text-brand-800 hover:underline"
                  >
                    {piquete.currentAnimal.name}
                  </Link>
                ) : (
                  <span className="text-neutral-400">Sem animal alocado</span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {piquete.status === "OCUPADO" ? (
                  <form action={vacatePiqueteAction.bind(null, piquete.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Desocupar
                    </button>
                  </form>
                ) : (
                  <form
                    action={occupyPiqueteAction.bind(null, piquete.id)}
                    className="flex gap-2"
                  >
                    <select
                      name="animalId"
                      required
                      className="flex-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-brand-600"
                    >
                      <option value="">Selecione o animal</option>
                      {animals.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
                    >
                      Ocupar
                    </button>
                  </form>
                )}

                <div className="flex gap-2">
                  {piquete.status !== "MANUTENCAO" && (
                    <form action={markPiqueteStatusAction.bind(null, piquete.id, "MANUTENCAO")} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                      >
                        Manutenção
                      </button>
                    </form>
                  )}
                  {piquete.status === "MANUTENCAO" && (
                    <form action={markPiqueteStatusAction.bind(null, piquete.id, "LIVRE")} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                      >
                        Liberar
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                <Link
                  href={`/hipica/piquetes/${piquete.id}`}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Histórico e edição
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/hipica/piquetes/${piquete.id}`}
                    className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Link>
                  <DeleteButton onDelete={deletePiqueteAction.bind(null, piquete.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
