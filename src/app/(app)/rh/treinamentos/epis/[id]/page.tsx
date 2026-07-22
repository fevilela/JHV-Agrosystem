import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getEpiFields } from "../../epi-fields";
import { updateEpiAction } from "../../epi-actions";

export default async function EditEpiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [issuance, employees] = await Promise.all([
    prisma.epiIssuance.findUnique({ where: { id } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!issuance) notFound();

  const t = await getTranslations("rh.epis");
  const tf = await getTranslations("rh.epis.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getEpiFields(tf)}
        action={updateEpiAction.bind(null, id)}
        initialValues={issuance}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos/epis"
      />
    </div>
  );
}
