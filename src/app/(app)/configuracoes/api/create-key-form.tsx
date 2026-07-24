"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, KeyRound } from "lucide-react";
import { createApiKeyAction } from "./actions";

export function CreateKeyForm() {
  const t = useTranslations("configuracoes.api");
  const [state, formAction, isPending] = useActionState(createApiKeyAction, undefined);
  const [copied, setCopied] = useState(false);
  const token = state && "token" in state ? state.token : null;

  if (token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="mb-2 text-sm font-medium text-amber-900">{t("tokenCreatedTitle")}</p>
        <p className="mb-3 text-xs text-amber-800">{t("tokenShownOnce")}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 text-xs text-neutral-800">
            {token}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(token);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-neutral-600">{t("nameLabel")}</label>
        <input
          name="name"
          required
          placeholder={t("namePlaceholder")}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
      >
        <KeyRound size={15} />
        {isPending ? t("creating") : t("createKey")}
      </button>
      {state && "error" in state && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
