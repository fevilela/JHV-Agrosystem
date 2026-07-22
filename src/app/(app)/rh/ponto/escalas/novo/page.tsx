import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getScheduleFields } from "../../schedule-fields";
import { createScheduleAction } from "../../schedule-actions";

export default async function NewSchedulePage() {
  const { organizationId } = await requireOrg();
  const employees = await prisma.employee.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const t = await getTranslations("rh.escalas");
  const tf = await getTranslations("rh.escalas.fields");
  const tShift = await getTranslations("labels.scheduleShift");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getScheduleFields(tf, tShift)}
        action={createScheduleAction}
        initialValues={{ shift: "INTEGRAL" }}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/ponto/escalas"
      />
    </div>
  );
}
