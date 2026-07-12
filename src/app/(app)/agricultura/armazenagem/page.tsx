import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { storageTypeLabels } from "@/lib/labels";

export default async function ArmazenagemListPage() {
  const storages = await prisma.storage.findMany({
    orderBy: { code: "asc" },
    include: { movements: true },
  });

  const withStock = storages.map((s) => {
    const stock = s.movements.reduce((sum, m) => {
      if (m.type === "ENTRADA") return sum + Number(m.quantityTon);
      return sum - Number(m.quantityTon);
    }, 0);
    return { ...s, stock };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Armazenagem</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {storages.length} {storages.length === 1 ? "unidade cadastrada" : "unidades cadastradas"}
          </p>
        </div>
        <Link
          href="/agricultura/armazenagem/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          Novo Silo/Armazém
        </Link>
      </div>

      {withStock.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          Nenhum silo ou armazém cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withStock.map((s) => (
            <Link
              key={s.id}
              href={`/agricultura/armazenagem/${s.id}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900">{s.code}</h2>
                  <p className="text-xs text-neutral-500">{s.name || storageTypeLabels[s.type]}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {storageTypeLabels[s.type]}
                </span>
              </div>

              <dl className="mt-4 space-y-1 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Estoque atual</dt>
                  <dd className="font-medium text-neutral-800">
                    {s.stock.toLocaleString("pt-BR")} ton
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Capacidade</dt>
                  <dd>{s.capacityTon ? `${s.capacityTon} ton` : "—"}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
