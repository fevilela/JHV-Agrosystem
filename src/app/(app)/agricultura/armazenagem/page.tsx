import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { ExportButton } from "@/components/crud/export-button";

export default async function ArmazenagemListPage() {
  const { organizationId } = await requireOrg();
  const storages = await prisma.storage.findMany({
    where: { organizationId },
    orderBy: { code: "asc" },
    include: { movements: true },
  });

  const withStock = storages.map((s) => {
    const stock = s.movements.reduce((sum, m) => {
      if (m.type === "ENTRADA") return sum + Number(m.quantityTon);
      return sum - Number(m.quantityTon);
    }, 0);
    return { ...s, stock };
  });

  const t = await getTranslations("agricultura.armazenagem");
  const tType = await getTranslations("labels.storageType");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: storages.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton baseHref="/api/export/armazenagem" />
          <Link
            href="/agricultura/armazenagem/novo"
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            {t("new")}
          </Link>
        </div>
      </div>

      {withStock.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-400">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withStock.map((s) => (
            <Link
              key={s.id}
              href={`/agricultura/armazenagem/${s.id}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900">{s.code}</h2>
                  <p className="text-xs text-neutral-500">{s.name || tType(s.type)}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {tType(s.type)}
                </span>
              </div>

              <dl className="mt-4 space-y-1 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <dt className="text-neutral-400">{t("currentStock")}</dt>
                  <dd className="font-medium text-neutral-800">
                    {t("tonUnit", { value: s.stock.toLocaleString(locale) })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">{t("capacity")}</dt>
                  <dd>{s.capacityTon ? t("tonUnit", { value: Number(s.capacityTon) }) : "—"}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
