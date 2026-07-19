"use client";

import { useActionState } from "react";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";

export function AddUserForm({ action }: { action: FormAction }) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nome</label>
          <input type="text" name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input type="email" name="email" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Senha</label>
          <input type="password" name="password" required minLength={6} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Função</label>
          <select name="role" defaultValue="FUNCIONARIO" className={inputClass}>
            <option value="ADMIN">Administrador</option>
            <option value="GERENTE">Gerente</option>
            <option value="FUNCIONARIO">Funcionário</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Adicionando..." : "Adicionar Usuário"}
      </button>
    </form>
  );
}
