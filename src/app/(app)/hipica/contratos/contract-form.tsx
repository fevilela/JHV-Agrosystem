"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { contractTypeLabels } from "@/lib/labels";
import { SearchableSelect } from "@/components/crud/searchable-select";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";

export type ClientOption = {
  id: string;
  name: string;
  cpfCnpj: string | null;
  address: string | null;
  streetNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
};

export function ContractForm({
  action,
  clients,
  animals,
  stalls,
  piquetes,
}: {
  action: FormAction;
  clients: ClientOption[];
  animals: { id: string; name: string }[];
  stalls: { id: string; code: string; location: string | null }[];
  piquetes: { id: string; code: string; location: string | null }[];
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [type, setType] = useState<"AULAS" | "PIQUETE" | "BAIA">("AULAS");
  const [clientId, setClientId] = useState("");

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) ?? null,
    [clients, clientId]
  );

  return (
    <form action={formAction} className="space-y-7 rounded-2xl border border-neutral-200 bg-white p-7">
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tipo de Contrato</label>
          <select
            name="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className={inputClass}
          >
            {Object.entries(contractTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Cliente <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            name="clientId"
            required
            value={clientId}
            onChange={setClientId}
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            searchPlaceholder="Buscar por nome..."
            className={inputClass}
          />
        </div>

        {selectedClient && (
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-xs text-neutral-500 sm:col-span-2">
            <p>
              <span className="font-medium text-neutral-700">CPF/CNPJ:</span>{" "}
              {selectedClient.cpfCnpj || "não cadastrado"}
            </p>
            <p className="mt-0.5">
              <span className="font-medium text-neutral-700">Endereço:</span>{" "}
              {[
                selectedClient.address,
                selectedClient.streetNumber ? `nº ${selectedClient.streetNumber}` : null,
                selectedClient.neighborhood,
                selectedClient.city && selectedClient.state
                  ? `${selectedClient.city}/${selectedClient.state}`
                  : selectedClient.city,
              ]
                .filter(Boolean)
                .join(", ") || "não cadastrado"}
            </p>
            <p className="mt-1 text-neutral-400">
              Esses dados são preenchidos automaticamente no contrato a partir do cadastro do cliente.
            </p>
          </div>
        )}

        <div>
          <label className={labelClass}>Animal</label>
          <SearchableSelect
            name="animalId"
            options={animals.map((a) => ({ value: a.id, label: a.name }))}
            searchPlaceholder="Buscar por nome..."
            className={inputClass}
          />
        </div>

        {type === "BAIA" && (
          <div>
            <label className={labelClass}>
              Baia <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              name="stallId"
              required
              options={stalls.map((s) => ({ value: s.id, label: `${s.code}${s.location ? ` — ${s.location}` : ""}` }))}
              searchPlaceholder="Buscar por nome..."
              className={inputClass}
            />
          </div>
        )}

        {type === "PIQUETE" && (
          <div>
            <label className={labelClass}>
              Piquete <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              name="piqueteId"
              required
              options={piquetes.map((p) => ({ value: p.id, label: `${p.code}${p.location ? ` — ${p.location}` : ""}` }))}
              searchPlaceholder="Buscar por nome..."
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>
            Valor Mensal (R$) <span className="text-red-500">*</span>
          </label>
          <input type="number" name="monthlyValue" step="0.01" required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>
            Dia de Vencimento <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="dueDay"
            min={1}
            max={28}
            defaultValue={10}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Data de Início <span className="text-red-500">*</span>
          </label>
          <input type="date" name="startDate" required className={inputClass} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Observações</label>
          <textarea name="notes" rows={3} className={inputClass} />
        </div>
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
          {isPending ? "Gerando..." : "Gerar Contrato"}
        </button>
        <Link
          href="/hipica/contratos"
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
