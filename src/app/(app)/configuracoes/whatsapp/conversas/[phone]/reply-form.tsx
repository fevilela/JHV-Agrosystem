"use client";

import { useActionState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { enviarMensagemAction } from "../actions";

export function ReplyForm({ phone }: { phone: string }) {
  const [state, formAction, isPending] = useActionState(
    enviarMensagemAction.bind(null, phone),
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isPending && !state?.error) {
      formRef.current?.reset();
    }
  }, [isPending, state]);

  return (
    <form ref={formRef} action={formAction} className="border-t border-neutral-200 p-3">
      {state?.error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          name="texto"
          required
          rows={2}
          placeholder="Escreva uma mensagem..."
          className="flex-1 resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white transition hover:bg-brand-800 disabled:opacity-50"
          title="Enviar"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-neutral-400">
        Mensagem de texto livre só funciona até 24h depois da última mensagem do cliente. Fora
        desse prazo, é preciso usar um modelo aprovado pela Meta.
      </p>
    </form>
  );
}
