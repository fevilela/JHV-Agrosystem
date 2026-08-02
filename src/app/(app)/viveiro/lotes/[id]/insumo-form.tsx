"use client";

import { useActionState } from "react";
import { addMudaLoteInsumoAction } from "../actions";

type FormState = { error?: string } | undefined;

type StockItemOption = {
  id: string;
  code: string;
  name: string;
  currentQuantity: string;
  unit: string | null;
};

export function InsumoForm({
  loteId,
  stockItems,
}: {
  loteId: string;
  stockItems: StockItemOption[];
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    addMudaLoteInsumoAction.bind(null, loteId),
    undefined
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Registrar Consumo de Insumo
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <select
          name="stockItemId"
          required
          className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        >
          <option value="">Selecione o insumo</option>
          {stockItems.map((i) => (
            <option key={i.id} value={i.id}>
              {i.code} — {i.name} ({i.currentQuantity} {i.unit || ""} em estoque)
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          name="quantidade"
          placeholder="Quantidade"
          required
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        />
        <input
          type="number"
          step="0.01"
          name="unitCost"
          placeholder="Custo unitário (opcional)"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        />
        <input
          name="notes"
          placeholder="Observações (opcional)"
          className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        />
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Registrando..." : "Registrar Consumo"}
      </button>
    </form>
  );
}
