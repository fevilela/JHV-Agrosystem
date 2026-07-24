import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getTalhaoFields } from "../fields";
import { createTalhaoAction } from "../actions";

export default async function NewTalhaoPage() {
  const { organizationId } = await requireOrg();
  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const t = await getTranslations("agricultura.talhoes");
  const tf = await getTranslations("agricultura.talhoes.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getTalhaoFields(tf)}
        action={createTalhaoAction}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/agricultura/talhoes"
      />
    </div>
  );
}
