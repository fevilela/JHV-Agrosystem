"use client";

import { useActionState } from "react";
import Link from "next/link";
import { navGroups, RETROFITTED_MODULES } from "@/lib/nav";

type FormState = { error?: string } | undefined;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-600";

export type OrganizationValues = {
  name: string;
  cpfCnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  zipCode: string | null;
  streetNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  allowedModules: string[];
  active: boolean;
  hasMpToken?: boolean;
  hasResendKey?: boolean;
  resendFromEmail?: string | null;
};

const moduleLabels = new Map(
  navGroups.filter((g) => RETROFITTED_MODULES.includes(g.key)).map((g) => [g.key, g.label])
);

export function OrganizationForm({
  action,
  initialValues,
  showActiveToggle,
}: {
  action: FormAction;
  initialValues?: OrganizationValues;
  showActiveToggle?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-7 rounded-2xl border border-neutral-200 bg-white p-7">
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Razão Social / Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialValues?.name}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>CPF/CNPJ</label>
          <input type="text" name="cpfCnpj" defaultValue={initialValues?.cpfCnpj ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefone</label>
          <input type="text" name="phone" defaultValue={initialValues?.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input type="text" name="email" defaultValue={initialValues?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>CEP</label>
          <input type="text" name="zipCode" defaultValue={initialValues?.zipCode ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Endereço</label>
          <input type="text" name="address" defaultValue={initialValues?.address ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Número</label>
          <input
            type="text"
            name="streetNumber"
            defaultValue={initialValues?.streetNumber ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          <input
            type="text"
            name="neighborhood"
            defaultValue={initialValues?.neighborhood ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Cidade</label>
          <input type="text" name="city" defaultValue={initialValues?.city ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>UF</label>
          <input type="text" name="state" defaultValue={initialValues?.state ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Token de Acesso do Mercado Pago (dessa organização)
        </label>
        <input
          type="password"
          name="mpAccessToken"
          autoComplete="off"
          placeholder={
            initialValues?.hasMpToken
              ? "•••••••••••••••• (preenchido — deixe em branco para manter)"
              : "APP_USR-..."
          }
          className={inputClass}
        />
        <p className="mt-2 text-xs text-neutral-400">
          Usado pra gerar e confirmar os boletos dessa organização na conta do Mercado Pago dela
          (não a da JHV). Cada cliente precisa da própria conta configurada aqui antes de conseguir
          gerar boletos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Chave de API da Resend (dessa organização)</label>
          <input
            type="password"
            name="resendApiKey"
            autoComplete="off"
            placeholder={
              initialValues?.hasResendKey
                ? "•••••••••••••••• (preenchida — deixe em branco para manter)"
                : "re_..."
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>E-mail remetente</label>
          <input
            type="text"
            name="resendFromEmail"
            placeholder="Hípica X <cobranca@hipicax.com>"
            defaultValue={initialValues?.resendFromEmail ?? ""}
            className={inputClass}
          />
        </div>
        <p className="text-xs text-neutral-400 sm:col-span-2">
          Usados pra enviar o boleto por e-mail ao cliente (além do WhatsApp). O e-mail remetente
          precisa estar verificado na conta Resend dessa organização.
        </p>
      </div>

      <div>
        <label className={labelClass}>Módulos liberados</label>
        <div className="flex flex-wrap gap-4">
          {RETROFITTED_MODULES.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name={`module_${key}`}
                defaultChecked={initialValues?.allowedModules.includes(key) ?? false}
                className="h-4 w-4 rounded-md border-neutral-300 text-brand-700 focus:ring-2 focus:ring-brand-100"
              />
              {moduleLabels.get(key) ?? key}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          Só aparecem aqui os módulos que já têm isolamento de dados por organização. Os demais
          ainda não podem ser liberados por cliente.
        </p>
      </div>

      {showActiveToggle && (
        <label className="flex items-center gap-2.5 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initialValues?.active ?? true}
            className="h-4 w-4 rounded-md border-neutral-300 text-brand-700 focus:ring-2 focus:ring-brand-100"
          />
          Organização ativa
        </label>
      )}

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
          href="/admin"
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
