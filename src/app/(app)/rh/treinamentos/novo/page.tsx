import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getTrainingFields } from "../fields";
import { createTrainingAction } from "../actions";

export default async function NewTrainingPage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  const t = await getTranslations("rh.treinamentos");
  const tf = await getTranslations("rh.treinamentos.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getTrainingFields(tf)}
        action={createTrainingAction}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos"
      />
    </div>
  );
}
