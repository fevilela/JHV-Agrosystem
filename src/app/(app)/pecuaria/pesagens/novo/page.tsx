import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getWeightFields } from "../fields";
import { createWeightAction } from "../actions";

export default async function NewWeightPage() {
  const { organizationId } = await requireOrg();
  const animals = await prisma.livestockAnimal.findMany({ where: { organizationId }, orderBy: { brinco: "asc" } });

  const t = await getTranslations("pecuaria.pesagens");
  const tf = await getTranslations("pecuaria.pesagens.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getWeightFields(tf)}
        action={createWeightAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/pesagens"
        offline={{ moduleLabel: t("title"), syncEndpoint: "/api/sync/pesagens" }}
      />
    </div>
  );
}
