import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTratoAction } from "./actions";

export default async function TratosCulturaisListPage() {
  const { organizationId } = await requireOrg();
  const tratos = await prisma.tratoCultural.findMany({
    where: { safra: { talhao: { organizationId } } },
    orderBy: { date: "desc" },
    include: { safra: true },
  });

  const t = await getTranslations("agricultura.tratosCulturais");
  const tType = await getTranslations("labels.tratoCulturalType");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: tratos.length })}
          </p>
        </div>
        {/* Plain <a>, not <Link>: this page has offline support, and only a
        real browser navigation (not a client-side RSC transition) is
        handled by the service worker's cache. */}
        <a
          href="/agricultura/tratos-culturais/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          {t("new")}
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.date")}</th>
              <th className="px-4 py-3">{t("table.safra")}</th>
              <th className="px-4 py-3">{t("table.type")}</th>
              <th className="px-4 py-3">{t("table.product")}</th>
              <th className="px-4 py-3">{t("table.dose")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {tratos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {tratos.map((tr) => (
              <tr key={tr.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(tr.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{tr.safra.name}</td>
                <td className="px-4 py-3 text-neutral-700">{tType(tr.type)}</td>
                <td className="px-4 py-3 text-neutral-700">{tr.product || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{tr.dose || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/tratos-culturais/${tr.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTratoAction.bind(null, tr.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
