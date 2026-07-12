import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { serviceOrderFields } from "../fields";
import {
  updateServiceOrderAction,
  deleteServiceOrderAction,
  markServiceOrderCompletedAction,
  addServiceOrderPartAction,
  deleteServiceOrderPartAction,
} from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatCurrency } from "@/lib/labels";

export default async function ServiceOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, machines, mechanics, stockItems] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id },
      include: { parts: { include: { stockItem: true }, orderBy: { createdAt: "desc" } } },
    }),
    prisma.machine.findMany({ orderBy: { type: "asc" } }),
    prisma.mechanic.findMany({ orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!order) notFound();

  const partsCost = order.parts.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.unitCost ?? 0),
    0
  );
  const totalCost = Number(order.laborCost ?? 0) + partsCost;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/oficina/ordens-servico" className="text-sm text-neutral-500 hover:text-neutral-800">
            ← Ordens de Serviço
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">
            {order.description} — Custo total: {formatCurrency(totalCost)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {order.status !== "CONCLUIDA" && order.status !== "CANCELADA" && (
            <form action={markServiceOrderCompletedAction.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Marcar concluída
              </button>
            </form>
          )}
          <DeleteButton onDelete={deleteServiceOrderAction.bind(null, id)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={serviceOrderFields}
          action={updateServiceOrderAction.bind(null, id)}
          initialValues={order}
          relationOptions={{
            machineId: machines.map((m) => ({
              id: m.id,
              label: [m.brand, m.model, m.plateOrSerial].filter(Boolean).join(" ") || m.type,
            })),
            mechanicId: mechanics.map((m) => ({ id: m.id, label: m.name })),
          }}
          backHref="/oficina/ordens-servico"
        />

        <div className="space-y-4">
          <form
            action={addServiceOrderPartAction.bind(null, id)}
            className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Adicionar Peça
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <select
                name="stockItemId"
                required
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              >
                <option value="">Selecione o item</option>
                {stockItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code} — {i.name} ({String(i.currentQuantity)} {i.unit || ""} em estoque)
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                name="quantity"
                placeholder="Quantidade"
                required
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
              <input
                type="number"
                step="0.01"
                name="unitCost"
                placeholder="Custo Unitário (R$)"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
            >
              Adicionar
            </button>
          </form>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Peças Utilizadas
            </h2>
            {order.parts.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhuma peça adicionada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {order.parts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-neutral-800">{p.stockItem.name}</span>{" "}
                      <span className="text-neutral-600">
                        {String(p.quantity)} {p.stockItem.unit || ""}
                      </span>
                      {p.unitCost && (
                        <span className="block text-xs text-neutral-400">
                          {formatCurrency(p.unitCost)} / un — Subtotal:{" "}
                          {formatCurrency(Number(p.quantity) * Number(p.unitCost))}
                        </span>
                      )}
                    </div>
                    <DeleteButton onDelete={deleteServiceOrderPartAction.bind(null, id, p.id)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
