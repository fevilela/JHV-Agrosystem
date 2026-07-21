"use client";

import { useActionState } from "react";
import { salvarWhatsappTokenAction } from "./actions";

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";

export function WhatsappTokenForm({ organizationId }: { organizationId: string }) {
  const [state, formAction, isPending] = useActionState(
    salvarWhatsappTokenAction.bind(null, organizationId),
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>Phone Number ID</label>
        <input type="text" name="phoneNumberId" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Token de Acesso Permanente (Usuário do Sistema)</label>
        <input type="password" name="accessToken" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>WABA ID (opcional)</label>
        <input type="text" name="wabaId" className={inputClass} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Conectado com sucesso!
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar conexão"}
      </button>
    </form>
  );
}
