import { InsumoForm } from "./insumo-form";
import { deleteMudaLoteInsumoAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate } from "@/lib/labels";

type Insumo = {
  id: string;
  data: Date;
  quantidade: unknown;
  unitCost: unknown;
  notes: string | null;
  stockItem: { name: string; unit: string | null };
};

type StockItemOption = {
  id: string;
  code: string;
  name: string;
  currentQuantity: string;
  unit: string | null;
};

export function InsumosSection({
  loteId,
  insumos,
  stockItems,
}: {
  loteId: string;
  insumos: Insumo[];
  stockItems: StockItemOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InsumoForm loteId={loteId} stockItems={stockItems} />

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Insumos Consumidos
        </h3>
        {insumos.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum insumo registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {insumos.map((i) => (
              <li key={i.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-neutral-800">{i.stockItem.name}</span>{" "}
                  <span className="text-neutral-600">
                    {String(i.quantidade)} {i.stockItem.unit || ""}
                  </span>
                  {i.unitCost != null && (
                    <span className="block text-xs text-neutral-400">
                      Custo unitário: {String(i.unitCost)}
                    </span>
                  )}
                  <span className="block text-xs text-neutral-400">
                    {formatDate(i.data)}
                    {i.notes ? ` — ${i.notes}` : ""}
                  </span>
                </div>
                <DeleteButton onDelete={deleteMudaLoteInsumoAction.bind(null, loteId, i.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
