"use client";

import { useActionState } from "react";
import { confirmMudaPedidoVendaAction } from "../actions";

type FormState = { error?: string } | undefined;

export function ConfirmButton({ pedidoId }: { pedidoId: string }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    confirmMudaPedidoVendaAction.bind(null, pedidoId),
    undefined
  );

  return (
    <form action={formAction} className="space-y-2">
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Confirmando..." : "Confirmar Pedido"}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
