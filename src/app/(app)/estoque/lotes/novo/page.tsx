import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getStockBatchFields } from "../fields";
import { createStockBatchAction } from "../actions";

export default async function NewStockBatchPage() {
  const { organizationId } = await requireOrg();
  const items = await prisma.stockItem.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
  const t = await getTranslations("estoque.lotes");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getStockBatchFields(t)}
        action={createStockBatchAction}
        relationOptions={{
          stockItemId: items.map((i) => ({ id: i.id, label: `${i.code} — ${i.name}` })),
        }}
        backHref="/estoque/lotes"
      />
    </div>
  );
}
