"use client";

import { useActionState } from "react";
import { redefinirSenhaAction } from "./actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    redefinirSenhaAction.bind(null, token),
    undefined
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-7"
    >
      <div>
        <label
          htmlFor="senha"
          className="mb-1.5 block text-sm font-medium text-neutral-600"
        >
          Nova senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label
          htmlFor="confirmacao"
          className="mb-1.5 block text-sm font-medium text-neutral-600"
        >
          Confirme a nova senha
        </label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Definir senha"}
      </button>
    </form>
  );
}
