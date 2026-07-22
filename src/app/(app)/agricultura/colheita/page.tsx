import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteHarvestAction } from "./actions";

export default async function ColheitaListPage() {
  const harvests = await prisma.harvest.findMany({
    orderBy: { date: "desc" },
    include: { safra: { include: { talhao: true } } },
  });

  const totalKg = harvests.reduce((sum, h) => sum + Number(h.producaoKg ?? 0), 0);

  const t = await getTranslations("agricultura.colheita");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("summary", { count: harvests.length, total: totalKg.toLocaleString(locale) })}
          </p>
        </div>
        <Link
          href="/agricultura/colheita/novo"
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
              <th className="px-4 py-3">{t("table.safra")}</th>
              <th className="px-4 py-3">{t("table.talhao")}</th>
              <th className="px-4 py-3">{t("table.production")}</th>
              <th className="px-4 py-3">{t("table.moisture")}</th>
              <th className="px-4 py-3">{t("table.quality")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {harvests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {harvests.map((h) => (
              <tr key={h.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(h.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{h.safra.name}</td>
                <td className="px-4 py-3 text-neutral-700">{h.safra.talhao.code}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {h.producaoKg ? t("weightUnit", { value: Number(h.producaoKg) }) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {h.umidade ? t("moistureUnit", { value: Number(h.umidade) }) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{h.qualidade || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/colheita/${h.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteHarvestAction.bind(null, h.id)} />
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
