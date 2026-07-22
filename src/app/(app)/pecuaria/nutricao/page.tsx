import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteFeedingAction } from "./actions";

export default async function NutricaoListPage() {
  const { organizationId } = await requireOrg();
  const feedings = await prisma.livestockFeeding.findMany({
    where: { lote: { organizationId } },
    orderBy: { date: "desc" },
    include: { lote: true },
  });

  const t = await getTranslations("pecuaria.nutricao");
  const tType = await getTranslations("labels.feedingType");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: feedings.length })}
          </p>
        </div>
        <Link
          href="/pecuaria/nutricao/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          {t("new")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.date")}</th>
              <th className="px-4 py-3">{t("table.lote")}</th>
              <th className="px-4 py-3">{t("table.type")}</th>
              <th className="px-4 py-3">{t("table.consumption")}</th>
              <th className="px-4 py-3">{t("table.dailyCost")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {feedings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {feedings.map((f) => (
              <tr key={f.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(f.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{f.lote.code}</td>
                <td className="px-4 py-3 text-neutral-700">{tType(f.type)}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {f.consumoKg ? t("weightUnit", { value: Number(f.consumoKg) }) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(f.custoDiario, locale)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/nutricao/${f.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteFeedingAction.bind(null, f.id)} />
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
