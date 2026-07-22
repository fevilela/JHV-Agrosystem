import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getHarvestFields } from "../fields";
import { createHarvestAction } from "../actions";

export default async function NewHarvestPage() {
  const safras = await prisma.safra.findMany({
    orderBy: { name: "asc" },
    include: { talhao: true },
  });

  const t = await getTranslations("agricultura.colheita");
  const tf = await getTranslations("agricultura.colheita.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getHarvestFields(tf)}
        action={createHarvestAction}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/colheita"
      />
    </div>
  );
}
