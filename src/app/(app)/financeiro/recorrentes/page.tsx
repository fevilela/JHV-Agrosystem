import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/labels";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteRecurringBillingAction } from "./actions";

export default async function RecurringBillingListPage() {
  const templates = await prisma.recurringBilling.findMany({
    orderBy: { dayOfMonth: "asc" },
    include: { client: true },
  });

  const t = await getTranslations("financeiro.recorrentes");
  const locale = await getLocale();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t("count", { count: templates.length })}
          </p>
        </div>
        <Link
          href="/financeiro/recorrentes/novo"
          className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          <Plus size={16} />
          {t("new")}
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-500">{t("description")}</p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">{t("table.generation")}</th>
              <th className="px-4 py-3">{t("table.dueDate")}</th>
              <th className="px-4 py-3">{t("table.client")}</th>
              <th className="px-4 py-3">{t("table.description")}</th>
              <th className="px-4 py-3">{t("table.amount")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  {t("empty")}
                </td>
              </tr>
            )}
            {templates.map((template) => (
              <tr key={template.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{t("day", { day: template.dayOfMonth })}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {t("day", { day: template.dueDay ?? template.dayOfMonth })}
                </td>
                <td className="px-4 py-3 text-neutral-700">{template.client.name}</td>
                <td className="px-4 py-3 text-neutral-700">{template.description}</td>
                <td className="px-4 py-3 text-neutral-700">{formatCurrency(template.amount, locale)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      template.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {template.active ? t("active") : t("inactive")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/financeiro/recorrentes/${template.id}`}
                      className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                      title={t("edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton onDelete={deleteRecurringBillingAction.bind(null, template.id)} />
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
