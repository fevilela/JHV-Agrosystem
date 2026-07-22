import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteSafraAction } from "./actions";

const statusColor: Record<string, string> = {
  PLANEJADA: "bg-neutral-100 text-neutral-600",
  EM_ANDAMENTO: "bg-blue-50 text-blue-700",
  COLHIDA: "bg-green-50 text-green-700",
  CANCELADA: "bg-red-50 text-red-700",
};

export default async function SafraListPage() {
  const { organizationId } = await requireOrg();
  const safras = await prisma.safra.findMany({
    where: { talhao: { organizationId } },
    orderBy: { dataInicio: "desc" },
    include: { talhao: true },
  });

  const t = await getTranslations("agricultura.safra");
  const tStatus = await getTranslations("labels.safraStatus");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: safras.length })}
          </p>
        </div>
        <Link
          href="/agricultura/safra/novo"
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
              <th className="px-4 py-3">{t("table.safra")}</th>
              <th className="px-4 py-3">{t("table.talhao")}</th>
              <th className="px-4 py-3">{t("table.cultura")}</th>
              <th className="px-4 py-3">{t("table.start")}</th>
              <th className="px-4 py-3">{t("table.expectedCost")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {safras.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {safras.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{s.name}</td>
                <td className="px-4 py-3 text-neutral-700">{s.talhao.code}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {s.cultura}
                  {s.variedade && <span className="block text-xs text-neutral-400">{s.variedade}</span>}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(s.dataInicio, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(s.custoPrevisto, locale)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[s.status]}`}>
                    {tStatus(s.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/safra/${s.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteSafraAction.bind(null, s.id)} />
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
