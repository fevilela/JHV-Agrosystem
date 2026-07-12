import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

const sexoLabel: Record<string, string> = {
  MACHO: "Macho",
  FEMEA: "Fêmea",
  CASTRADO: "Castrado",
};

const statusLabel: Record<string, string> = {
  ATIVO: "Ativo",
  VENDIDO: "Vendido",
  EMPRESTADO: "Emprestado",
  OBITO: "Óbito",
  INATIVO: "Inativo",
};

const statusColor: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  VENDIDO: "bg-blue-50 text-blue-700",
  EMPRESTADO: "bg-amber-50 text-amber-700",
  OBITO: "bg-neutral-100 text-neutral-500",
  INATIVO: "bg-neutral-100 text-neutral-500",
};

export default async function AnimaisListPage() {
  const animals = await prisma.animal.findMany({
    orderBy: { name: "asc" },
    include: { owner: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Animais / Cavalos
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {animals.length}{" "}
            {animals.length === 1 ? "animal cadastrado" : "animais cadastrados"}
          </p>
        </div>
        <Link
          href="/cadastro/animais/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Animal
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {animals.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
            Nenhum animal cadastrado ainda.
          </p>
        )}

        {animals.map((animal) => (
          <Link
            key={animal.id}
            href={`/cadastro/animais/${animal.id}`}
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-neutral-900">
                  {animal.name}
                </h2>
                <p className="text-xs text-neutral-500">
                  {animal.raca || "Raça não informada"}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  statusColor[animal.status]
                }`}
              >
                {statusLabel[animal.status]}
              </span>
            </div>

            <dl className="mt-4 space-y-1 text-sm text-neutral-600">
              <div className="flex justify-between">
                <dt className="text-neutral-400">Registro</dt>
                <dd>{animal.registro || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Sexo</dt>
                <dd>{animal.sexo ? sexoLabel[animal.sexo] : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Proprietário</dt>
                <dd>{animal.owner?.name || "—"}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
