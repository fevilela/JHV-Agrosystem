"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { enviarContratoEmailAction } from "../actions";

export function SendContractEmailButton({ contractId }: { contractId: string }) {
  const [state, formAction, isPending] = useActionState(
    enviarContratoEmailAction.bind(null, contractId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
      >
        <Mail size={16} />
        {isPending ? "Enviando..." : "Enviar por E-mail"}
      </button>
      {state?.error && (
        <p className="max-w-xs text-right text-xs text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="max-w-xs text-right text-xs text-green-700">E-mail enviado!</p>
      )}
    </form>
  );
}
