import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMilkAction } from "./actions";

export default async function ProducaoLeiteListPage() {
  const records = await prisma.milkProduction.findMany({
    orderBy: { date: "desc" },
    include: { animal: true },
  });

  const totalLitros = records.reduce((sum, r) => sum + Number(r.liters), 0);

  const t = await getTranslations("pecuaria.producaoLeite");
  const tShift = await getTranslations("labels.milkShift");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("summary", { count: records.length, total: totalLitros.toLocaleString(locale) })}
          </p>
        </div>
        <Link
          href="/pecuaria/producao-leite/novo"
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
              <th className="px-4 py-3">{t("table.animal")}</th>
              <th className="px-4 py-3">{t("table.shift")}</th>
              <th className="px-4 py-3">{t("table.liters")}</th>
              <th className="px-4 py-3">{t("table.ccs")}</th>
              <th className="px-4 py-3">{t("table.cbt")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.animal.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">{r.shift ? tShift(r.shift) : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{t("litersUnit", { value: Number(r.liters) })}</td>
                <td className="px-4 py-3 text-neutral-700">{r.ccs ? String(r.ccs) : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{r.cbt ? String(r.cbt) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/producao-leite/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMilkAction.bind(null, r.id)} />
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
