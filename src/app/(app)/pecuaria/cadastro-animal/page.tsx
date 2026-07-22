import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteLivestockAnimalAction } from "./actions";

const statusColor: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  VENDIDO: "bg-blue-50 text-blue-700",
  ABATIDO: "bg-neutral-100 text-neutral-500",
  OBITO: "bg-neutral-100 text-neutral-500",
  INATIVO: "bg-neutral-100 text-neutral-500",
};

export default async function LivestockAnimalListPage() {
  const { organizationId } = await requireOrg();
  const animals = await prisma.livestockAnimal.findMany({
    where: { organizationId },
    orderBy: { brinco: "asc" },
    include: { lote: true, pasture: true },
  });

  const t = await getTranslations("pecuaria.cadastroAnimal");
  const tSexo = await getTranslations("labels.animalSexo");
  const tCategory = await getTranslations("labels.livestockCategory");
  const tStatus = await getTranslations("labels.livestockStatus");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: animals.length })}
          </p>
        </div>
        <Link
          href="/pecuaria/cadastro-animal/novo"
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
              <th className="px-4 py-3">{t("table.brinco")}</th>
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="px-4 py-3">{t("table.sexo")}</th>
              <th className="px-4 py-3">{t("table.category")}</th>
              <th className="px-4 py-3">{t("table.lote")}</th>
              <th className="px-4 py-3">{t("table.pasture")}</th>
              <th className="px-4 py-3">{t("table.weight")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {animals.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {animals.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{a.brinco}</td>
                <td className="px-4 py-3 text-neutral-700">{a.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{a.sexo ? tSexo(a.sexo) : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{tCategory(a.category)}</td>
                <td className="px-4 py-3 text-neutral-700">{a.lote?.code || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{a.pasture?.code || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {a.pesoAtual ? t("weightUnit", { value: Number(a.pesoAtual) }) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status]}`}>
                    {tStatus(a.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/pecuaria/cadastro-animal/${a.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteLivestockAnimalAction.bind(null, a.id)} />
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
