"use client";

import { useActionState } from "react";
import Link from "next/link";

type Option = { id: string; label: string };
type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function LaudoForm({
  action,
  produtores,
  responsaveis,
  amostras,
  initialValues,
  selectedAmostraIds,
  backHref,
}: {
  action: FormAction;
  produtores: Option[];
  responsaveis: Option[];
  amostras: Option[];
  initialValues?: {
    numero?: string;
    produtorId?: string;
    responsavelAssinanteId?: string;
    interpretacaoAgronomica?: string | null;
    recomendacaoCalagemAdubacao?: string | null;
    templateUtilizado?: string | null;
    dataValidade?: Date | string | null;
  };
  selectedAmostraIds?: string[];
  backHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const inputClass =
    "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";
  const selected = new Set(selectedAmostraIds ?? []);

  const dataValidadeStr = initialValues?.dataValidade
    ? new Date(initialValues.dataValidade).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="space-y-7 rounded-2xl border border-neutral-200 bg-white p-7">
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Nº do Laudo<span className="text-red-500"> *</span>
          </label>
          <input name="numero" required defaultValue={initialValues?.numero} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            Produtor<span className="text-red-500"> *</span>
          </label>
          <select name="produtorId" required defaultValue={initialValues?.produtorId} className={inputClass}>
            <option value="">Selecione</option>
            {produtores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Responsável Técnico Assinante<span className="text-red-500"> *</span>
          </label>
          <select
            name="responsavelAssinanteId"
            required
            defaultValue={initialValues?.responsavelAssinanteId}
            className={inputClass}
          >
            <option value="">Selecione</option>
            {responsaveis.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Template Utilizado</label>
          <input name="templateUtilizado" defaultValue={initialValues?.templateUtilizado ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Data de Validade do Laudo</label>
          <input name="dataValidade" type="date" defaultValue={dataValidadeStr} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Amostras Vinculadas</label>
          <select name="amostraIds" multiple size={6} className={inputClass}>
            {amostras.map((a) => (
              <option key={a.id} value={a.id} selected={selected.has(a.id)}>
                {a.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-400">Segure Ctrl (ou Cmd) pra selecionar mais de uma amostra.</p>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Interpretação Agronômica dos Resultados</label>
          <textarea
            name="interpretacaoAgronomica"
            rows={3}
            defaultValue={initialValues?.interpretacaoAgronomica ?? ""}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Recomendação de Calagem/Adubação</label>
          <textarea
            name="recomendacaoCalagemAdubacao"
            rows={3}
            defaultValue={initialValues?.recomendacaoCalagemAdubacao ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
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
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
