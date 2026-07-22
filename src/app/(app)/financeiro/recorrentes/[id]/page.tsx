import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getRecurringBillingFields } from "../fields";
import { updateRecurringBillingAction } from "../actions";

export default async function EditRecurringBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [template, clients] = await Promise.all([
    prisma.recurringBilling.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!template) notFound();

  const t = await getTranslations("financeiro.recorrentes");
  const tf = await getTranslations("financeiro.recorrentes.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getRecurringBillingFields(tf)}
        action={updateRecurringBillingAction.bind(null, id)}
        initialValues={template}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/financeiro/recorrentes"
      />
    </div>
  );
}
