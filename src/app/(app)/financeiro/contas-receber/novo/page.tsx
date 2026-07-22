import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getReceivableFields } from "../fields";
import { createReceivableAction } from "../actions";

export default async function NewReceivablePage() {
  const { organizationId } = await requireOrg();
  const [clients, costCenters] = await Promise.all([
    prisma.client.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  const t = await getTranslations("financeiro.contasReceber");
  const tf = await getTranslations("financeiro.contasReceber.fields");
  const tStatus = await getTranslations("labels.financeEntryStatus");
  const tPaymentMethod = await getTranslations("labels.paymentMethod");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getReceivableFields(tf, tStatus, tPaymentMethod)}
        action={createReceivableAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          clientId: clients.map((c) => ({ id: c.id, label: c.name })),
          costCenterId: costCenters.map((c) => ({ id: c.id, label: `${c.code} — ${c.name}` })),
        }}
        backHref="/financeiro/contas-receber"
      />
    </div>
  );
}
