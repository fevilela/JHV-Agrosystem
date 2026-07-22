import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getPlantioFields } from "../fields";
import { createPlantioAction } from "../actions";

export default async function NewPlantioPage() {
  const { organizationId } = await requireOrg();
  const safras = await prisma.safra.findMany({
    where: { talhao: { organizationId } },
    orderBy: { name: "asc" },
    include: { talhao: true },
  });

  const t = await getTranslations("agricultura.plantio");
  const tf = await getTranslations("agricultura.plantio.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getPlantioFields(tf)}
        action={createPlantioAction}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/plantio"
      />
    </div>
  );
}
