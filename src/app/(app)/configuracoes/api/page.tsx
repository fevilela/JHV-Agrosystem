import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { CreateKeyForm } from "./create-key-form";
import { RevokeKeyButton } from "./revoke-key-button";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/animais" },
  { method: "GET", path: "/api/v1/animais/{id}" },
  { method: "GET", path: "/api/v1/talhoes" },
  { method: "GET", path: "/api/v1/pastagens" },
  { method: "GET", path: "/api/v1/financeiro/contas-a-pagar" },
  { method: "GET", path: "/api/v1/financeiro/contas-a-receber" },
  { method: "GET", path: "/api/v1/estoque/materiais" },
];

export default async function ApiSettingsPage() {
  const { organizationId } = await requireOrg();
  const keys = await prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  const t = await getTranslations("configuracoes.api");
  const locale = await getLocale();

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">{t("description")}</p>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">{t("newKeyTitle")}</h2>
        <CreateKeyForm />
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-700">{t("keysTitle")}</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="px-4 py-3">{t("table.prefix")}</th>
              <th className="px-4 py-3">{t("table.createdAt")}</th>
              <th className="px-4 py-3">{t("table.lastUsedAt")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{k.name}</td>
                <td className="px-4 py-3">
                  <code className="text-xs text-neutral-500">{k.keyPrefix}…</code>
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(k.createdAt, locale)}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {k.lastUsedAt ? formatDate(k.lastUsedAt, locale) : t("neverUsed")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      k.revoked ? "bg-neutral-100 text-neutral-500" : "bg-green-50 text-green-700"
                    }`}
                  >
                    {k.revoked ? t("revoked") : t("active")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{!k.revoked && <RevokeKeyButton id={k.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-800">{t("docsTitle")}</h2>
        <p className="mb-4 text-xs text-neutral-600">{t("docsDescription")}</p>
        <div className="mb-4 space-y-1">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="flex items-center gap-2 text-xs">
              <span className="rounded bg-white px-1.5 py-0.5 font-mono font-medium text-brand-700">
                {e.method}
              </span>
              <code className="text-neutral-700">{e.path}</code>
            </div>
          ))}
        </div>
        <p className="mb-1 text-xs font-medium text-neutral-700">{t("docsAuthLabel")}</p>
        <code className="block overflow-x-auto rounded bg-white px-3 py-2 text-xs text-neutral-700">
          curl -H &quot;Authorization: Bearer SUA_CHAVE&quot; https://seu-dominio/api/v1/animais
        </code>
        <p className="mt-3 text-xs text-neutral-500">{t("docsPagination")}</p>
      </div>
    </div>
  );
}
