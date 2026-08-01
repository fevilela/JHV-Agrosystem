"use client";

import { useActionState } from "react";
import { esqueciSenhaAction } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(esqueciSenhaAction, undefined);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-7 text-center">
        <p className="text-sm text-neutral-700">
          Se esse e-mail existir no sistema, enviamos um link de redefinição de senha para ele.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-7"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-neutral-600"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          placeholder="seu@email.com"
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
        {isPending ? "Enviando..." : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
