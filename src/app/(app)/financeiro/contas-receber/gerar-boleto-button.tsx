"use client";

import { useActionState } from "react";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { gerarBoletoAction } from "./actions";

export function GerarBoletoButton({ entryId }: { entryId: string }) {
  const t = useTranslations("financeiro.contasReceber");
  const [state, formAction, isPending] = useActionState(
    gerarBoletoAction.bind(null, entryId),
    undefined
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
      >
        <FileText size={13} />
        {isPending ? t("generating") : t("generateBoleto")}
      </button>
      {state?.error && (
        <p className="max-w-[220px] text-right text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
