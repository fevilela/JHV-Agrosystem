import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getFertilityFields } from "../fields";
import { createFertilityAction } from "../actions";

export default async function NewFertilityPage() {
  const { organizationId } = await requireOrg();
  const talhoes = await prisma.talhao.findMany({ where: { organizationId }, orderBy: { code: "asc" } });

  const t = await getTranslations("agricultura.fertilidade");
  const tf = await getTranslations("agricultura.fertilidade.fields");
  const tType = await getTranslations("labels.fertilityType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getFertilityFields(tf, tType)}
        action={createFertilityAction}
        relationOptions={{
          talhaoId: talhoes.map((t2) => ({ id: t2.id, label: t2.code })),
        }}
        backHref="/agricultura/fertilidade"
      />
    </div>
  );
}
