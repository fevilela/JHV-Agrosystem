"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

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
            Data <span className="text-red-500">*</span>
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
            Descrição <span className="text-red-500">*</span>
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
          <h3 className="text-sm font-semibold text-neutral-700">Partidas</h3>
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
          >
            <Plus size={14} />
            Adicionar linha
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2">Conta</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Valor</th>
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
                      <option value="">Selecione</option>
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
                      <option value="DEBITO">Débito</option>
                      <option value="CREDITO">Crédito</option>
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
                      title="Remover linha"
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
            Total Débito:{" "}
            <strong>{totalDebito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
          </span>
          <span className="text-neutral-600">
            Total Crédito:{" "}
            <strong>{totalCredito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              balanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {balanced ? "Fechado" : "Não fechado"}
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
