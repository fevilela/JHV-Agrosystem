import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";

const statusColor: Record<string, string> = {
  ABERTA: "bg-amber-50 text-amber-700",
  EM_ANDAMENTO: "bg-blue-50 text-blue-700",
  CONCLUIDA: "bg-green-50 text-green-700",
  CANCELADA: "bg-neutral-100 text-neutral-500",
};

export default async function ServiceOrderListPage() {
  const orders = await prisma.serviceOrder.findMany({
    orderBy: { openDate: "desc" },
    include: { machine: true, mechanic: true, parts: true },
  });
  const t = await getTranslations("oficina.ordensServico");
  const tStatus = await getTranslations("labels.serviceOrderStatus");
  const tMachineType = await getTranslations("labels.machineType");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("recordCount", { count: orders.length })}
          </p>
        </div>
        <Link
          href="/oficina/ordens-servico/novo"
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
              <th className="px-4 py-3">{t("table.open")}</th>
              <th className="px-4 py-3">{t("table.machine")}</th>
              <th className="px-4 py-3">{t("table.description")}</th>
              <th className="px-4 py-3">{t("table.mechanic")}</th>
              <th className="px-4 py-3">{t("table.parts")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">
                  <Link href={`/oficina/ordens-servico/${o.id}`} className="hover:underline">
                    {formatDate(o.openDate, locale)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {tMachineType(o.machine.type)}
                  {o.machine.plateOrSerial && (
                    <span className="block text-xs text-neutral-400">{o.machine.plateOrSerial}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700">{o.description}</td>
                <td className="px-4 py-3 text-neutral-700">{o.mechanic?.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{o.parts.length}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status]}`}>
                    {tStatus(o.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
