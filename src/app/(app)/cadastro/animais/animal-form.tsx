"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchableSelect } from "@/components/crud/searchable-select";

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
  const t = useTranslations("cadastro.animais.form");
  const tl = useTranslations("labels");
  const tc = useTranslations("common");

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {t("identification")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("name")} <span className="text-red-500">*</span>
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
              {t("registro")}
            </label>
            <input
              name="registro"
              defaultValue={(animal?.registro as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("microchip")}
            </label>
            <input
              name="microchip"
              defaultValue={(animal?.microchip as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("especie")}
            </label>
            <input
              name="especie"
              defaultValue={(animal?.especie as string) ?? "Equino"}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("raca")}
            </label>
            <input
              name="raca"
              defaultValue={(animal?.raca as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("sexo")}
            </label>
            <select
              name="sexo"
              defaultValue={(animal?.sexo as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="">{tc("select")}</option>
              <option value="MACHO">{tl("animalSexo.MACHO")}</option>
              <option value="FEMEA">{tl("animalSexo.FEMEA")}</option>
              <option value="CASTRADO">{tl("animalSexo.CASTRADO")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("pelagem")}
            </label>
            <input
              name="pelagem"
              defaultValue={(animal?.pelagem as string) ?? ""}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("dataNascimento")}
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
              {t("peso")}
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
              {t("altura")}
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
              {t("status")}
            </label>
            <select
              name="status"
              defaultValue={(animal?.status as string) ?? "ATIVO"}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            >
              <option value="ATIVO">{tl("animalStatus.ATIVO")}</option>
              <option value="VENDIDO">{tl("animalStatus.VENDIDO")}</option>
              <option value="EMPRESTADO">{tl("animalStatus.EMPRESTADO")}</option>
              <option value="OBITO">{tl("animalStatus.OBITO")}</option>
              <option value="INATIVO">{tl("animalStatus.INATIVO")}</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {t("ownerGenealogy")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("owner")}
            </label>
            <SearchableSelect
              name="ownerId"
              defaultValue={(animal?.ownerId as string) ?? ""}
              options={owners.map((o) => ({ value: o.id, label: o.name }))}
              placeholder={t("noOwner")}
              searchPlaceholder={tc("searchPlaceholder")}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("father")}
            </label>
            <SearchableSelect
              name="paiId"
              defaultValue={(animal?.paiId as string) ?? ""}
              options={animalsForGenealogy.map((a) => ({ value: a.id, label: a.name }))}
              placeholder={t("notInformed")}
              searchPlaceholder={tc("searchPlaceholder")}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("mother")}
            </label>
            <SearchableSelect
              name="maeId"
              defaultValue={(animal?.maeId as string) ?? ""}
              options={animalsForGenealogy.map((a) => ({ value: a.id, label: a.name }))}
              placeholder={t("notInformed")}
              searchPlaceholder={tc("searchPlaceholder")}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>
        </div>
      </section>

      <section>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          {t("notes")}
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
