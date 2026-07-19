"use client";

import { useActionState } from "react";
import { navGroups, RETROFITTED_MODULES } from "@/lib/nav";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";

export type UserFormValues = {
  name: string;
  email: string;
  role: string;
  allowedModules: string[];
};

const moduleLabels = new Map(
  navGroups.filter((g) => RETROFITTED_MODULES.includes(g.key)).map((g) => [g.key, g.label])
);

export function UserForm({
  action,
  initialValues,
  passwordRequired,
  submitLabel,
}: {
  action: FormAction;
  initialValues?: UserFormValues;
  passwordRequired: boolean;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nome</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialValues?.name}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            name="email"
            required
            defaultValue={initialValues?.email}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Senha{!passwordRequired && " (deixe em branco pra manter a atual)"}
          </label>
          <input
            type="password"
            name="password"
            required={passwordRequired}
            minLength={6}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Função</label>
          <select name="role" defaultValue={initialValues?.role ?? "FUNCIONARIO"} className={inputClass}>
            <option value="ADMIN">Administrador</option>
            <option value="GERENTE">Gerente</option>
            <option value="FUNCIONARIO">Funcionário</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Módulos liberados pra esse usuário</label>
        <div className="flex flex-wrap gap-4">
          {RETROFITTED_MODULES.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name={`module_${key}`}
                defaultChecked={initialValues?.allowedModules.includes(key) ?? false}
                className="h-4 w-4 rounded-md border-neutral-300 text-brand-700 focus:ring-2 focus:ring-brand-100"
              />
              {moduleLabels.get(key) ?? key}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          Administradores sempre têm acesso a todos os módulos liberados pra organização,
          independente dessas caixinhas — elas só valem pra Gerente/Funcionário.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
