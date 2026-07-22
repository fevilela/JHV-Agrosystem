import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getPurchaseOrderFields } from "../fields";
import { createPurchaseOrderAction } from "../actions";

export default async function NewPurchaseOrderPage() {
  const { organizationId } = await requireOrg();
  const [suppliers, quotations] = await Promise.all([
    prisma.supplier.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
    prisma.quotation.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, include: { supplier: true } }),
  ]);
  const t = await getTranslations("compras.pedidos");
  const tStatus = await getTranslations("labels.purchaseOrderStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getPurchaseOrderFields(t, tStatus)}
        action={createPurchaseOrderAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          supplierId: suppliers.map((s) => ({ id: s.id, label: s.name })),
          quotationId: quotations.map((q) => ({
            id: q.id,
            label: `${q.supplier.name} — ${q.description || t("noDescription")}`,
          })),
        }}
        backHref="/compras/pedidos"
      />
    </div>
  );
}
