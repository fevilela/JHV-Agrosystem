import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteMachineAction } from "./actions";

const statusColor: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
  INATIVO: "bg-neutral-100 text-neutral-500",
  VENDIDO: "bg-blue-50 text-blue-700",
};

export default async function MachineListPage() {
  const { organizationId } = await requireOrg();
  const machines = await prisma.machine.findMany({
    where: { organizationId },
    orderBy: [{ type: "asc" }, { brand: "asc" }],
  });
  const t = await getTranslations("maquinas.cadastro");
  const tType = await getTranslations("labels.machineType");
  const tStatus = await getTranslations("labels.machineStatus");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("recordCount", { count: machines.length })}
          </p>
        </div>
        <Link
          href="/maquinas/cadastro/novo"
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
              <th className="px-4 py-3">{t("table.type")}</th>
              <th className="px-4 py-3">{t("table.brandModel")}</th>
              <th className="px-4 py-3">{t("table.plateSerial")}</th>
              <th className="px-4 py-3">{t("table.year")}</th>
              <th className="px-4 py-3">{t("table.horimeter")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {machines.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {machines.map((m) => (
              <tr key={m.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{tType(m.type)}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {[m.brand, m.model].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{m.plateOrSerial || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{m.year ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {m.horimetroAtual ? `${m.horimetroAtual} h` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[m.status]}`}>
                    {tStatus(m.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/maquinas/cadastro/${m.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("table.edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteMachineAction.bind(null, m.id)} />
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
