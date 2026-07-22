import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTalhaoAction } from "./actions";

export default async function TalhoesListPage() {
  const { organizationId } = await requireOrg();
  const talhoes = await prisma.talhao.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
    include: { _count: { select: { safras: true } } },
  });

  const t = await getTranslations("agricultura.talhoes");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: talhoes.length })}
          </p>
        </div>
        <Link
          href="/agricultura/talhoes/novo"
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
              <th className="px-4 py-3">{t("table.code")}</th>
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="px-4 py-3">{t("table.area")}</th>
              <th className="px-4 py-3">{t("table.soil")}</th>
              <th className="px-4 py-3">{t("table.safras")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {talhoes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {talhoes.map((t2) => (
              <tr key={t2.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{t2.code}</td>
                <td className="px-4 py-3 text-neutral-700">{t2.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {t2.areaHectares ? t("areaUnit", { value: Number(t2.areaHectares) }) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{t2.soilType || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{t2._count.safras}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/talhoes/${t2.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteTalhaoAction.bind(null, t2.id)} />
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
