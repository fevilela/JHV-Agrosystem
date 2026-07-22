import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteReproductionAction } from "./actions";

const diagnosisColor: Record<string, string> = {
  PRENHE: "bg-green-50 text-green-700",
  VAZIA: "bg-neutral-100 text-neutral-500",
  INDEFINIDO: "bg-amber-50 text-amber-700",
};

export default async function ReproducaoListPage() {
  const { organizationId } = await requireOrg();
  const records = await prisma.reproduction.findMany({
    where: { animal: { organizationId } },
    orderBy: { date: "desc" },
    include: { animal: true },
  });

  const t = await getTranslations("pecuaria.reproducao");
  const tMethod = await getTranslations("labels.reproductionMethod");
  const tDiagnosis = await getTranslations("labels.diagnosisResult");
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
        <Link
          href="/pecuaria/reproducao/novo"
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
              <th className="px-4 py-3">{t("table.method")}</th>
              <th className="px-4 py-3">{t("table.diagnosis")}</th>
              <th className="px-4 py-3">{t("table.expectedBirth")}</th>
              <th className="px-4 py-3">{t("table.birth")}</th>
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
                <td className="px-4 py-3 text-neutral-700">{tMethod(r.method)}</td>
                <td className="px-4 py-3">
                  {r.diagnosisResult ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diagnosisColor[r.diagnosisResult]}`}>
                      {tDiagnosis(r.diagnosisResult)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.expectedBirthDate, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.birthDate, locale)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/reproducao/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteReproductionAction.bind(null, r.id)} />
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
