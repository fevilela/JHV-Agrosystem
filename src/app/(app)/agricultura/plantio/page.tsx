import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deletePlantioAction } from "./actions";

export default async function PlantioListPage() {
  const plantios = await prisma.plantio.findMany({
    orderBy: { date: "desc" },
    include: { safra: { include: { talhao: true } } },
  });

  const t = await getTranslations("agricultura.plantio");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: plantios.length })}
          </p>
        </div>
        <Link
          href="/agricultura/plantio/novo"
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
              <th className="px-4 py-3">{t("table.seeds")}</th>
              <th className="px-4 py-3">{t("table.population")}</th>
              <th className="px-4 py-3">{t("table.machine")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {plantios.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {plantios.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(p.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{p.safra.name}</td>
                <td className="px-4 py-3 text-neutral-700">{p.safra.talhao.code}</td>
                <td className="px-4 py-3 text-neutral-700">{p.sementes || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {p.populacaoPlantasHa ? t("populationUnit", { value: Number(p.populacaoPlantasHa) }) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{p.maquina || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/agricultura/plantio/${p.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deletePlantioAction.bind(null, p.id)} />
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
