import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteWeightAction } from "./actions";

export default async function PesagensListPage() {
  const { organizationId } = await requireOrg();
  const records = await prisma.weightRecord.findMany({
    where: { animal: { organizationId } },
    orderBy: [{ animalId: "asc" }, { date: "asc" }],
    include: { animal: true },
  });

  const withGmd = records.map((r, i) => {
    const prev = records[i - 1];
    let gmd: number | null = null;
    if (prev && prev.animalId === r.animalId) {
      const days =
        (new Date(r.date).getTime() - new Date(prev.date).getTime()) /
        (1000 * 60 * 60 * 24);
      if (days > 0) {
        gmd = (Number(r.weightKg) - Number(prev.weightKg)) / days;
      }
    }
    return { ...r, gmd };
  });

  withGmd.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const t = await getTranslations("pecuaria.pesagens");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: records.length })}
          </p>
        </div>
        {/* Plain <a>, not <Link>: this page has offline support, and only a
        real browser navigation (not a client-side RSC transition) is
        handled by the service worker's cache. */}
        <a
          href="/pecuaria/pesagens/novo"
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
              <th className="px-4 py-3">{t("table.animal")}</th>
              <th className="px-4 py-3">{t("table.weight")}</th>
              <th className="px-4 py-3">{t("table.gmd")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {withGmd.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {withGmd.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.animal.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {t("weightUnit", { value: Number(r.weightKg) })}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {r.gmd !== null ? (
                    <span className={r.gmd >= 0 ? "text-green-700" : "text-red-600"}>
                      {t("gmdUnit", { value: r.gmd.toFixed(2) })}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/pesagens/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteWeightAction.bind(null, r.id)} />
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
