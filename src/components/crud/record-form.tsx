"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { enqueueWrite } from "@/lib/offline-queue";

type FormState = { error?: string } | undefined;
type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;

export type RecordFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "checkbox"
  | "select"
  | "relation";

export type RecordField = {
  name: string;
  label: string;
  type: RecordFieldType;
  required?: boolean;
  colSpan?: 1 | 2;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type RelationOption = { id: string; label: string };

function toInputValue(value: unknown, type: string) {
  if (value === null || value === undefined) return "";
  if (type === "date") {
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }
  return String(value);
}

export type OfflineSync = { moduleLabel: string; syncEndpoint: string };

export function RecordForm({
  fields,
  action,
  initialValues,
  relationOptions,
  backHref,
  offline,
}: {
  fields: RecordField[];
  action: FormAction;
  initialValues?: Record<string, unknown>;
  relationOptions?: Record<string, RelationOption[]>;
  backHref: string;
  offline?: OfflineSync;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [savedOffline, setSavedOffline] = useState(false);
  const t = useTranslations("common");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!offline || navigator.onLine) return;
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    await enqueueWrite({ endpoint: offline.syncEndpoint, moduleLabel: offline.moduleLabel, payload: data });
    form.reset();
    setSavedOffline(true);
  }

  return (
    <form
      action={formAction}
      onSubmit={offline ? handleSubmit : undefined}
      className="space-y-7 rounded-2xl border border-neutral-200 bg-white p-7"
    >
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => {
          const value = initialValues?.[field.name];
          const wide = field.colSpan === 2 ? "sm:col-span-2" : "";
          const label = (
            <label className="mb-1.5 block text-sm font-medium text-neutral-600">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
          );

          if (field.type === "checkbox") {
            return (
              <label
                key={field.name}
                className={`flex items-center gap-2.5 text-sm text-neutral-700 ${wide}`}
              >
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={Boolean(value)}
                  className="h-4 w-4 rounded-md border-neutral-300 text-brand-700 focus:ring-2 focus:ring-brand-100"
                />
                {field.label}
              </label>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name} className={wide}>
                {label}
                <textarea
                  name={field.name}
                  rows={3}
                  defaultValue={toInputValue(value, field.type)}
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.name} className={wide}>
                {label}
                <select
                  name={field.name}
                  required={field.required}
                  defaultValue={toInputValue(value, field.type)}
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                >
                  {!field.required && <option value="">—</option>}
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "relation") {
            const options = relationOptions?.[field.name] ?? [];
            return (
              <div key={field.name} className={wide}>
                {label}
                <select
                  name={field.name}
                  required={field.required}
                  defaultValue={toInputValue(value, field.type)}
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                >
                  <option value="">{field.required ? t("select") : "—"}</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={field.name} className={wide}>
              {label}
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                step={field.type === "number" ? "0.01" : undefined}
                placeholder={field.placeholder}
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

      {savedOffline && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {t("savedOffline")}
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
