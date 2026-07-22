import Link from "next/link";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMechanicAction } from "./actions";

export default async function MechanicsAndPartsPage() {
  const [mechanics, parts] = await Promise.all([
    prisma.mechanic.findMany({ orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({
      where: { category: "PECA" },
      orderBy: { name: "asc" },
    }),
  ]);
  const t = await getTranslations("oficina.pecas");
  const tc = await getTranslations("cadastro.list");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("recordCount", { count: mechanics.length })}
          </p>
        </div>
        <Link
          href="/oficina/pecas/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          {t("new")}
        </Link>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="px-4 py-3">{t("table.specialty")}</th>
              <th className="px-4 py-3">{t("table.phone")}</th>
              <th className="px-4 py-3">{t("table.active")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {mechanics.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {mechanics.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{m.name}</td>
                <td className="px-4 py-3 text-neutral-700">{m.specialty || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{m.phone || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{m.active ? tc("yes") : tc("no")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/oficina/pecas/${m.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("table.edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMechanicAction.bind(null, m.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">{t("partsSection.title")}</h2>
        <Link
          href="/estoque/materiais"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          {t("partsSection.manageLink")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("partsSection.code")}</th>
              <th className="px-4 py-3">{t("partsSection.name")}</th>
              <th className="px-4 py-3">{t("partsSection.currentStock")}</th>
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("partsSection.noParts")}
                </td>
              </tr>
            )}
            {parts.map((p) => {
              const low = p.minQuantity !== null && Number(p.currentQuantity) < Number(p.minQuantity);
              return (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{p.code}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        low ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {low && <AlertTriangle size={12} />}
                      {String(p.currentQuantity)} {p.unit || ""}
                    </span>
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
