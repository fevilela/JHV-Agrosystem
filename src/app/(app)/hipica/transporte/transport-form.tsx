"use client";

import { useActionState } from "react";
import Link from "next/link";

type FormState = { error?: string } | undefined;
type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;

type Option = { id: string; name: string };

function dateValue(value: unknown) {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function TransportForm({
  action,
  transport,
  animals,
  selectedAnimalIds = [],
  backHref,
}: {
  action: FormAction;
  transport?: Record<string, unknown>;
  animals: Option[];
  selectedAnimalIds?: string[];
  backHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            required
            defaultValue={dateValue(transport?.date)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Motorista</label>
          <input
            name="driver"
            defaultValue={(transport?.driver as string) ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Origem</label>
          <input
            name="origin"
            defaultValue={(transport?.origin as string) ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Destino</label>
          <input
            name="destination"
            defaultValue={(transport?.destination as string) ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Veículo</label>
          <input
            name="vehicle"
            defaultValue={(transport?.vehicle as string) ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Animais transportados
        </label>
        {animals.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum animal cadastrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-3">
            {animals.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="animalIds"
                  value={a.id}
                  defaultChecked={selectedAnimalIds.includes(a.id)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-600"
                />
                {a.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Observações</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={(transport?.notes as string) ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
        <Link
          href={backHref}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
