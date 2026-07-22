import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getReproductionFields } from "../fields";
import { updateReproductionAction } from "../actions";

export default async function EditReproductionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, animals] = await Promise.all([
    prisma.reproduction.findUnique({ where: { id } }),
    prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } }),
  ]);

  if (!record) notFound();

  const t = await getTranslations("pecuaria.reproducao");
  const tf = await getTranslations("pecuaria.reproducao.fields");
  const tMethod = await getTranslations("labels.reproductionMethod");
  const tDiagnosis = await getTranslations("labels.diagnosisResult");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getReproductionFields(tf, tMethod, tDiagnosis)}
        action={updateReproductionAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/reproducao"
      />
    </div>
  );
}
