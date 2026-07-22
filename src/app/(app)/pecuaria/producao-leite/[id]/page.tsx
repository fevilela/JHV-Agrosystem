import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getMilkFields } from "../fields";
import { updateMilkAction } from "../actions";

export default async function EditMilkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, animals] = await Promise.all([
    prisma.milkProduction.findUnique({ where: { id } }),
    prisma.livestockAnimal.findMany({ orderBy: { brinco: "asc" } }),
  ]);

  if (!record) notFound();

  const t = await getTranslations("pecuaria.producaoLeite");
  const tf = await getTranslations("pecuaria.producaoLeite.fields");
  const tShift = await getTranslations("labels.milkShift");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getMilkFields(tf, tShift)}
        action={updateMilkAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          animalId: animals.map((a) => ({ id: a.id, label: `${a.brinco}${a.name ? ` — ${a.name}` : ""}` })),
        }}
        backHref="/pecuaria/producao-leite"
      />
    </div>
  );
}
