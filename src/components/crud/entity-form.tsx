"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { EntityConfig } from "@/lib/entities";

type FormState = { error?: string } | undefined;
type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;

function toInputValue(value: unknown, type: string) {
  if (value === null || value === undefined) return "";
  if (type === "date") {
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }
  if (value instanceof Object && "toString" in value) return String(value);
  return String(value);
}

export function EntityForm({
  config,
  action,
  initialValues,
  backHref,
}: {
  config: EntityConfig;
  action: FormAction;
  initialValues?: Record<string, unknown>;
  backHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {config.fields.map((field) => {
          const value = initialValues?.[field.name];
          const wide = field.colSpan === 2 ? "sm:col-span-2" : "";

          if (field.type === "checkbox") {
            return (
              <label
                key={field.name}
                className={`flex items-center gap-2 text-sm text-neutral-700 ${wide}`}
              >
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={
                    value === undefined ? true : Boolean(value)
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-600"
                />
                {field.label}
              </label>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name} className={wide}>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {field.label}
                </label>
                <textarea
                  name={field.name}
                  defaultValue={toInputValue(value, field.type)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>
            );
          }

          return (
            <div key={field.name} className={wide}>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                {field.label}
                {field.required && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                step={field.type === "number" ? "0.01" : undefined}
                defaultValue={toInputValue(value, field.type)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>
          );
        })}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
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
