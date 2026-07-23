import Link from "next/link";
import { Plus, Pencil, CalendarClock } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { formatDate } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteAttendanceAction } from "./actions";

const statusColor: Record<string, string> = {
  PRESENTE: "bg-green-50 text-green-700",
  FALTA: "bg-red-50 text-red-700",
  ATESTADO: "bg-amber-50 text-amber-700",
  FERIAS: "bg-blue-50 text-blue-700",
  FOLGA: "bg-neutral-100 text-neutral-500",
};

export default async function AttendanceListPage() {
  const { organizationId } = await requireOrg();
  const records = await prisma.attendance.findMany({
    where: { employee: { organizationId } },
    orderBy: { date: "desc" },
    include: { employee: true },
  });

  const t = await getTranslations("rh.ponto");
  const tStatus = await getTranslations("labels.attendanceStatus");
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
        <div className="flex items-center gap-2">
          <Link
            href="/rh/ponto/escalas"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <CalendarClock size={16} />
            {t("schedulesLink")}
          </Link>
          {/* Plain <a>, not <Link>: this page has offline support, and only
          a real browser navigation (not a client-side RSC transition) is
          handled by the service worker's cache. */}
          <a
            href="/rh/ponto/novo"
            className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            <Plus size={16} />
            {t("new")}
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.date")}</th>
              <th className="px-4 py-3">{t("table.employee")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3">{t("table.hours")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{formatDate(r.date, locale)}</td>
                <td className="px-4 py-3 text-neutral-700">{r.employee.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                    {tStatus(r.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {r.hoursWorked ? t("hours", { hours: Number(r.hoursWorked) }) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/rh/ponto/${r.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteAttendanceAction.bind(null, r.id)} />
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
