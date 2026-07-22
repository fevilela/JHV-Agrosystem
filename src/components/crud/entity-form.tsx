"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("common");

  return (
    <form
      action={formAction}
      className="space-y-7 rounded-2xl border border-neutral-200 bg-white p-7"
    >
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        {config.fields.map((field) => {
          const value = initialValues?.[field.name];
          const wide = field.colSpan === 2 ? "sm:col-span-2" : "";

          if (field.type === "checkbox") {
            return (
              <label
                key={field.name}
                className={`flex items-center gap-2.5 text-sm text-neutral-700 ${wide}`}
              >
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={
                    value === undefined ? true : Boolean(value)
                  }
                  className="h-4 w-4 rounded-md border-neutral-300 text-brand-700 focus:ring-2 focus:ring-brand-100"
                />
                {field.label}
              </label>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name} className={wide}>
                <label className="mb-1.5 block text-sm font-medium text-neutral-600">
                  {field.label}
                </label>
                <textarea
                  name={field.name}
                  defaultValue={toInputValue(value, field.type)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            );
          }

          return (
            <div key={field.name} className={wide}>
              <label className="mb-1.5 block text-sm font-medium text-neutral-600">
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
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
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
          {isPending ? t("saving") : t("save")}
        </button>
        <Link
          href={backHref}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
