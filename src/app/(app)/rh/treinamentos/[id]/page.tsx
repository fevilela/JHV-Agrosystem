import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getTrainingFields } from "../fields";
import { updateTrainingAction } from "../actions";

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [training, employees] = await Promise.all([
    prisma.training.findUnique({ where: { id } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!training) notFound();

  const t = await getTranslations("rh.treinamentos");
  const tf = await getTranslations("rh.treinamentos.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getTrainingFields(tf)}
        action={updateTrainingAction.bind(null, id)}
        initialValues={training}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos"
      />
    </div>
  );
}
