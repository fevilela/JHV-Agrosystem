import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getStorageFields } from "../fields";
import { updateStorageAction, createStorageMovementAction, deleteStorageMovementAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate } from "@/lib/labels";

export default async function StorageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [storage, safras] = await Promise.all([
    prisma.storage.findUnique({
      where: { id },
      include: {
        movements: { orderBy: { date: "desc" }, include: { safra: true } },
      },
    }),
    prisma.safra.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!storage) notFound();

  const stock = storage.movements.reduce((sum, m) => {
    if (m.type === "ENTRADA") return sum + Number(m.quantityTon);
    return sum - Number(m.quantityTon);
  }, 0);

  const t = await getTranslations("agricultura.armazenagem");
  const tf = await getTranslations("agricultura.armazenagem.fields");
  const tType = await getTranslations("labels.storageType");
  const tMovementType = await getTranslations("labels.storageMovementType");
  const locale = await getLocale();

  return (
    <div>
      <Link href="/agricultura/armazenagem" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← {t("backLink")}
      </Link>
      <h1 className="mt-1 mb-6 text-xl font-semibold text-neutral-900">
        {t("detailTitle", { code: storage.code, stock: stock.toLocaleString(locale) })}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecordForm
          fields={getStorageFields(tf, tType)}
          action={updateStorageAction.bind(null, id)}
          initialValues={storage}
          backHref="/agricultura/armazenagem"
        />

        <div className="space-y-4">
          <form
            action={createStorageMovementAction.bind(null, id)}
            className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {t("newMovement")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <select
                name="type"
                required
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 sm:col-span-1"
              >
                <option value="ENTRADA">{tMovementType("ENTRADA")}</option>
                <option value="SAIDA">{tMovementType("SAIDA")}</option>
                <option value="QUEBRA">{tMovementType("QUEBRA")}</option>
              </select>
              <input
                type="date"
                name="date"
                required
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 sm:col-span-1"
              />
              <input
                type="number"
                step="0.01"
                name="quantityTon"
                placeholder={tf("quantityTon")}
                required
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
              <input
                type="number"
                step="0.01"
                name="umidade"
                placeholder={tf("umidade")}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
              <select
                name="safraId"
                className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              >
                <option value="">{t("noSafra")}</option>
                {safras.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
            >
              {t("register")}
            </button>
          </form>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {t("history")}
            </h2>
            {storage.movements.length === 0 ? (
              <p className="text-sm text-neutral-400">{t("noMovements")}</p>
            ) : (
              <ul className="space-y-2">
                {storage.movements.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-neutral-800">
                        {tMovementType(m.type)}
                      </span>{" "}
                      <span className="text-neutral-600">{String(m.quantityTon)} ton</span>
                      {m.safra && (
                        <span className="block text-xs text-neutral-400">{m.safra.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{formatDate(m.date, locale)}</span>
                      <DeleteButton
                        onDelete={deleteStorageMovementAction.bind(null, id, m.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
