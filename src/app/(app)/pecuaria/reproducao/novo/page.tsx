import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getReproductionFields } from "../fields";
import { createReproductionAction } from "../actions";

export default async function NewReproductionPage() {
  const { organizationId } = await requireOrg();
  const animals = await prisma.livestockAnimal.findMany({ where: { organizationId }, orderBy: { brinco: "asc" } });

  const t = await getTranslations("pecuaria.reproducao");
  const tf = await getTranslations("pecuaria.reproducao.fields");
  const tMethod = await getTranslations("labels.reproductionMethod");
  const tDiagnosis = await getTranslations("labels.diagnosisResult");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getReproductionFields(tf, tMethod, tDiagnosis)}
        action={createReproductionAction}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/reproducao"
      />
    </div>
  );
}
