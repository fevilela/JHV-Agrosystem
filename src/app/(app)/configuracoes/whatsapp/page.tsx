import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { WhatsappTokenForm } from "./token-form";
import { desconectarWhatsappAction } from "./actions";

export default async function WhatsappSettingsPage() {
  const { organizationId } = await requireOrg();
  const connection = await prisma.whatsappConnection.findUnique({
    where: { organizationId },
  });
  const t = await getTranslations("configuracoes.whatsapp");
  const locale = await getLocale();

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">{t("description")}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          {connection ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-neutral-800">
                  {t("connected")}
                  {connection.businessName ? ` — ${connection.businessName}` : ""}
                </p>
              </div>
              <p className="text-xs text-neutral-500">
                {t("phoneNumberIdLabel")}: {connection.phoneNumberId}
                <br />
                {t("wabaIdLabel")}: {connection.wabaId || "—"}
                <br />
                {t("connectedAtLabel")}: {formatDate(connection.connectedAt, locale)}
              </p>
              <form action={desconectarWhatsappAction.bind(null, organizationId)}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  {t("disconnect")}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                <p className="text-sm font-medium text-neutral-600">{t("notConnected")}</p>
              </div>
              <WhatsappTokenForm organizationId={organizationId} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="mb-3 text-sm font-semibold text-neutral-800">{t("howToTitle")}</h2>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-neutral-600">
            {(["step1", "step2", "step3", "step4", "step5", "step6"] as const).map((step) => (
              <li key={step}>
                {t.rich(step, {
                  b: (chunks) => <span className="font-medium text-neutral-800">{chunks}</span>,
                  code: (chunks) => (
                    <code className="rounded bg-white px-1 py-0.5 text-xs">{chunks}</code>
                  ),
                })}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
