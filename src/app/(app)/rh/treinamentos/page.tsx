import Link from "next/link";
import { Plus, Pencil, AlertTriangle, HardHat } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteTrainingAction } from "./actions";

export default async function TrainingListPage() {
  const trainings = await prisma.training.findMany({
    orderBy: { date: "desc" },
    include: { employee: true },
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const t = await getTranslations("rh.treinamentos");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: trainings.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/rh/treinamentos/epis"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <HardHat size={16} />
            {t("episLink")}
          </Link>
          <Link
            href="/rh/treinamentos/novo"
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            {t("new")}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.date")}</th>
              <th className="px-4 py-3">{t("table.employee")}</th>
              <th className="px-4 py-3">{t("table.training")}</th>
              <th className="px-4 py-3">{t("table.provider")}</th>
              <th className="px-4 py-3">{t("table.validUntil")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {trainings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {trainings.map((tr) => {
              const expired = tr.validUntil && new Date(tr.validUntil) < now;
              const expiringSoon = tr.validUntil && !expired && new Date(tr.validUntil) <= soon;
              return (
                <tr key={tr.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{formatDate(tr.date, locale)}</td>
                  <td className="px-4 py-3 text-neutral-700">{tr.employee.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{tr.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{tr.provider || "—"}</td>
                  <td className="px-4 py-3">
                    {tr.validUntil ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          expired
                            ? "bg-red-50 text-red-700"
                            : expiringSoon
                              ? "bg-amber-50 text-amber-700"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {(expired || expiringSoon) && <AlertTriangle size={12} />}
                        {formatDate(tr.validUntil, locale)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/rh/treinamentos/${tr.id}`}
                        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        title={t("edit")}
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton onDelete={deleteTrainingAction.bind(null, tr.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
