import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteLoteAction } from "../lote-actions";

export default async function LotesListPage() {
  const lotes = await prisma.lote.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { animals: true } } },
  });

  const t = await getTranslations("pecuaria.lotes");
  const tCategory = await getTranslations("labels.livestockCategory");

  return (
    <div>
      <Link href="/pecuaria/manejo" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← {t("backLink")}
      </Link>
      <div className="mb-6 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: lotes.length })}
          </p>
        </div>
        <Link
          href="/pecuaria/manejo/lotes/novo"
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
              <th className="px-4 py-3">{t("table.category")}</th>
              <th className="px-4 py-3">{t("table.animals")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {lotes.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{l.code}</td>
                <td className="px-4 py-3 text-neutral-700">{l.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {l.category ? tCategory(l.category) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{l._count.animals}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/manejo/lotes/${l.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteLoteAction.bind(null, l.id)} />
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
