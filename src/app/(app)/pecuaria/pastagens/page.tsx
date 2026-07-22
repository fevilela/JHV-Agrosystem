import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";
import { deletePastureAction } from "./actions";

const statusColor: Record<string, string> = {
  EM_USO: "bg-green-50 text-green-700",
  DESCANSO: "bg-amber-50 text-amber-700",
};

export default async function PastagensListPage() {
  const { organizationId } = await requireOrg();
  const pastures = await prisma.pasture.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
    include: { _count: { select: { animals: true } } },
  });

  const t = await getTranslations("pecuaria.pastagens");
  const tStatus = await getTranslations("labels.pastureRotationStatus");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: pastures.length })}
          </p>
        </div>
        <Link
          href="/pecuaria/pastagens/novo"
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
              <th className="px-4 py-3">{t("table.stocking")}</th>
              <th className="px-4 py-3">{t("table.grassHeight")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pastures.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {pastures.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{p.code}</td>
                <td className="px-4 py-3 text-neutral-700">{p.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {p.areaHectares ? t("areaUnit", { value: Number(p.areaHectares) }) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {p._count.animals}
                  {p.capacityHead ? ` / ${p.capacityHead}` : ""}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {p.grassHeightCm ? t("heightUnit", { value: Number(p.grassHeightCm) }) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[p.rotationStatus]}`}>
                    {tStatus(p.rotationStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/pastagens/${p.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deletePastureAction.bind(null, p.id)} />
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
