import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { stallStatusLabels } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { SearchableSelect } from "@/components/crud/searchable-select";
import { requireModule } from "@/lib/tenant";
import {
  deleteStallAction,
  occupyStallAction,
  vacateStallAction,
  markStallStatusAction,
} from "./actions";

const statusColor: Record<string, string> = {
  LIVRE: "bg-neutral-100 text-neutral-600",
  OCUPADA: "bg-green-50 text-green-700",
  LIMPEZA: "bg-blue-50 text-blue-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
};

export default async function BaiaListPage() {
  const { organizationId } = await requireModule("hipica");
  const [stalls, animals] = await Promise.all([
    prisma.stall.findMany({
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
          <h1 className="text-xl font-semibold text-neutral-900">Baia</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {stalls.length} {stalls.length === 1 ? "baia cadastrada" : "baias cadastradas"}
          </p>
        </div>
        <Link
          href="/hipica/baia/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Nova Baia
        </Link>
      </div>

      {stalls.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhuma baia cadastrada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stalls.map((stall) => (
            <div key={stall.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900">{stall.code}</h2>
                  <p className="text-xs text-neutral-500">
                    {stall.location || "Localização não informada"}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[stall.status]}`}>
                  {stallStatusLabels[stall.status]}
                </span>
              </div>

              <div className="mt-3 text-sm text-neutral-600">
                {stall.currentAnimal ? (
                  <Link
                    href={`/cadastro/animais/${stall.currentAnimal.id}`}
                    className="text-brand-800 hover:underline"
                  >
                    {stall.currentAnimal.name}
                  </Link>
                ) : (
                  <span className="text-neutral-400">Sem animal alocado</span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {stall.status === "OCUPADA" ? (
                  <form action={vacateStallAction.bind(null, stall.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Desocupar
                    </button>
                  </form>
                ) : (
                  <form
                    action={occupyStallAction.bind(null, stall.id)}
                    className="flex gap-2"
                  >
                    <div className="flex-1">
                      <SearchableSelect
                        name="animalId"
                        required
                        options={animals.map((a) => ({ value: a.id, label: a.name }))}
                        placeholder="Selecione o animal"
                        searchPlaceholder="Buscar por nome..."
                        className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-brand-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800"
                    >
                      Ocupar
                    </button>
                  </form>
                )}

                <div className="flex gap-2">
                  {stall.status !== "LIMPEZA" && (
                    <form action={markStallStatusAction.bind(null, stall.id, "LIMPEZA")} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                      >
                        Limpeza
                      </button>
                    </form>
                  )}
                  {stall.status !== "MANUTENCAO" && (
                    <form action={markStallStatusAction.bind(null, stall.id, "MANUTENCAO")} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                      >
                        Manutenção
                      </button>
                    </form>
                  )}
                  {(stall.status === "LIMPEZA" || stall.status === "MANUTENCAO") && (
                    <form action={markStallStatusAction.bind(null, stall.id, "LIVRE")} className="flex-1">
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
                  href={`/hipica/baia/${stall.id}`}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Histórico e edição
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/hipica/baia/${stall.id}`}
                    className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Link>
                  <DeleteButton onDelete={deleteStallAction.bind(null, stall.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
