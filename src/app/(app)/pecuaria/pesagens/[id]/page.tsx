import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getWeightFields } from "../fields";
import { updateWeightAction } from "../actions";

export default async function EditWeightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, animals] = await Promise.all([
    prisma.weightRecord.findUnique({ where: { id } }),
    prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } }),
  ]);

  if (!record) notFound();

  const t = await getTranslations("pecuaria.pesagens");
  const tf = await getTranslations("pecuaria.pesagens.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getWeightFields(tf)}
        action={updateWeightAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/pesagens"
      />
    </div>
  );
}
