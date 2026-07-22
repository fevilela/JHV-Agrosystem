import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getRecurringBillingFields } from "../fields";
import { createRecurringBillingAction } from "../actions";

export default async function NewRecurringBillingPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  const t = await getTranslations("financeiro.recorrentes");
  const tf = await getTranslations("financeiro.recorrentes.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getRecurringBillingFields(tf)}
        action={createRecurringBillingAction}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
        }}
        backHref="/financeiro/recorrentes"
      />
    </div>
  );
}
