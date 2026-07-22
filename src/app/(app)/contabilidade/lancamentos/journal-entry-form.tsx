"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

type AccountOption = { id: string; code: string; name: string };

type Line = { accountId: string; type: "DEBITO" | "CREDITO"; amount: string };

export type InitialJournalEntry = {
  date: string;
  description: string;
  lines: Line[];
};

export function JournalEntryForm({
  accounts,
  action,
  initialValues,
  backHref,
}: {
  accounts: AccountOption[];
  action: FormAction;
  initialValues?: InitialJournalEntry;
  backHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const t = useTranslations("contabilidade.lancamentos.form");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [lines, setLines] = useState<Line[]>(
    initialValues?.lines ?? [
      { accountId: "", type: "DEBITO", amount: "" },
      { accountId: "", type: "CREDITO", amount: "" },
    ]
  );

  const totalDebito = lines
    .filter((l) => l.type === "DEBITO")
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const totalCredito = lines
    .filter((l) => l.type === "CREDITO")
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const balanced = totalDebito > 0 && Math.abs(totalDebito - totalCredito) < 0.005;

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { accountId: "", type: "DEBITO", amount: "" }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <input type="hidden" name="linesJson" value={JSON.stringify(lines)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {t("date")} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            required
            defaultValue={initialValues?.date}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {t("description")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="description"
            required
            defaultValue={initialValues?.description}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700">{t("lines")}</h3>
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
          >
            <Plus size={14} />
            {t("addLine")}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2">{t("account")}</th>
                <th className="px-3 py-2">{t("type")}</th>
                <th className="px-3 py-2">{t("value")}</th>
                <th className="px-3 py-2 text-right">—</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2">
                    <select
                      value={line.accountId}
                      onChange={(e) => updateLine(i, { accountId: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    >
                      <option value="">{t("select")}</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={line.type}
                      onChange={(e) => updateLine(i, { type: e.target.value as "DEBITO" | "CREDITO" })}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    >
                      <option value="DEBITO">{t("debit")}</option>
                      <option value="CREDITO">{t("credit")}</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.amount}
                      onChange={(e) => updateLine(i, { amount: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      disabled={lines.length <= 2}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      title={t("removeLine")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-neutral-600">
            {t("totalDebit")}:{" "}
            <strong>{totalDebito.toLocaleString(locale, { style: "currency", currency: "BRL" })}</strong>
          </span>
          <span className="text-neutral-600">
            {t("totalCredit")}:{" "}
            <strong>{totalCredito.toLocaleString(locale, { style: "currency", currency: "BRL" })}</strong>
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              balanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {balanced ? t("balanced") : t("unbalanced")}
          </span>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !balanced}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? tc("saving") : tc("save")}
        </button>
        <Link
          href={backHref}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          {tc("cancel")}
        </Link>
      </div>
    </form>
  );
}
