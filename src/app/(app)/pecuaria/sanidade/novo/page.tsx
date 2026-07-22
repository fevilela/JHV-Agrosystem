import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getHealthRecordFields } from "../fields";
import { createHealthRecordAction } from "../actions";

export default async function NewHealthRecordPage() {
  const { organizationId } = await requireOrg();
  const animals = await prisma.livestockAnimal.findMany({ where: { organizationId }, orderBy: { brinco: "asc" } });

  const t = await getTranslations("pecuaria.sanidade");
  const tf = await getTranslations("pecuaria.sanidade.fields");
  const tType = await getTranslations("labels.healthRecordType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getHealthRecordFields(tf, tType)}
        action={createHealthRecordAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/sanidade"
      />
    </div>
  );
}
