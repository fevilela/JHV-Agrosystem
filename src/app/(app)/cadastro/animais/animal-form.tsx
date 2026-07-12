"use client";

import { useActionState } from "react";
import Link from "next/link";

type FormState = { error?: string } | undefined;
type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;

type Option = { id: string; name: string };

function dateValue(value: unknown) {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function AnimalForm({
  action,
  animal,
  owners,
  animalsForGenealogy,
  backHref,
}: {
  action: FormAction;
  animal?: Record<string, unknown>;
  owners: Option[];
  animalsForGenealogy: Option[];
  backHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Identificação
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              defaultValue={(animal?.name as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Registro
            </label>
            <input
              name="registro"
              defaultValue={(animal?.registro as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Microchip
            </label>
            <input
              name="microchip"
              defaultValue={(animal?.microchip as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Espécie
            </label>
            <input
              name="especie"
              defaultValue={(animal?.especie as string) ?? "Equino"}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Raça
            </label>
            <input
              name="raca"
              defaultValue={(animal?.raca as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Sexo
            </label>
            <select
              name="sexo"
              defaultValue={(animal?.sexo as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="">Selecione</option>
              <option value="MACHO">Macho</option>
              <option value="FEMEA">Fêmea</option>
              <option value="CASTRADO">Castrado</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Pelagem
            </label>
            <input
              name="pelagem"
              defaultValue={(animal?.pelagem as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="dataNascimento"
              defaultValue={dateValue(animal?.dataNascimento)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.01"
              name="peso"
              defaultValue={(animal?.peso as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Altura (m)
            </label>
            <input
              type="number"
              step="0.01"
              name="altura"
              defaultValue={(animal?.altura as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={(animal?.status as string) ?? "ATIVO"}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="ATIVO">Ativo</option>
              <option value="VENDIDO">Vendido</option>
              <option value="EMPRESTADO">Emprestado</option>
              <option value="OBITO">Óbito</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Proprietário e Genealogia
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Proprietário
            </label>
            <select
              name="ownerId"
              defaultValue={(animal?.ownerId as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="">Sem proprietário</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Pai
            </label>
            <select
              name="paiId"
              defaultValue={(animal?.paiId as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="">Não informado</option>
              {animalsForGenealogy.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Mãe
            </label>
            <select
              name="maeId"
              defaultValue={(animal?.maeId as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="">Não informado</option>
              {animalsForGenealogy.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Observações
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={(animal?.notes as string) ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-neutral-100 pt-6">
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
