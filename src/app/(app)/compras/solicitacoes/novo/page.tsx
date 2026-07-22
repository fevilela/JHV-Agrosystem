import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getPurchaseRequestFields } from "../fields";
import { createPurchaseRequestAction } from "../actions";

export default async function NewPurchaseRequestPage() {
  const stockItems = await prisma.stockItem.findMany({ orderBy: { name: "asc" } });
  const t = await getTranslations("compras.solicitacoes");
  const tStatus = await getTranslations("labels.purchaseRequestStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getPurchaseRequestFields(t, tStatus)}
        action={createPurchaseRequestAction}
        initialValues={{ status: "PENDENTE" }}
        relationOptions={{
          stockItemId: stockItems.map((i) => ({ id: i.id, label: `${i.code} — ${i.name}` })),
        }}
        backHref="/compras/solicitacoes"
      />
    </div>
  );
}
