import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getEpiFields } from "../../epi-fields";
import { createEpiAction } from "../../epi-actions";

export default async function NewEpiPage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  const t = await getTranslations("rh.epis");
  const tf = await getTranslations("rh.epis.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getEpiFields(tf)}
        action={createEpiAction}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos/epis"
      />
    </div>
  );
}
