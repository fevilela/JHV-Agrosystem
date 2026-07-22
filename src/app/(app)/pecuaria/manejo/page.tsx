import Link from "next/link";
import { Plus, Pencil, Layers } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMovementAction } from "./actions";

const typeColor: Record<string, string> = {
  MOVIMENTACAO: "bg-blue-50 text-blue-700",
  EMBARQUE: "bg-amber-50 text-amber-700",
  COMPRA: "bg-purple-50 text-purple-700",
  VENDA: "bg-green-50 text-green-700",
};

export default async function ManejoListPage() {
  const movements = await prisma.managementMovement.findMany({
    orderBy: { date: "desc" },
    include: { animal: true, lote: true },
  });

  const t = await getTranslations("pecuaria.manejo");
  const tType = await getTranslations("labels.managementMovementType");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: movements.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pecuaria/manejo/lotes"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <Layers size={16} />
            {t("lotesLink")}
          </Link>
          <Link
            href="/pecuaria/manejo/novo"
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
              <th className="px-4 py-3">{t("table.type")}</th>
              <th className="px-4 py-3">{t("table.animalOrLote")}</th>
              <th className="px-4 py-3">{t("table.route")}</th>
              <th className="px-4 py-3">{t("table.value")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {movements.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(m.date, locale)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[m.type]}`}>
                    {tType(m.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {m.animal?.brinco ?? m.lote?.code ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {m.origin || "—"} → {m.destination || "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(m.value, locale)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/manejo/${m.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMovementAction.bind(null, m.id)} />
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
