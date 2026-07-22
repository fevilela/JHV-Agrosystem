import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getScheduleFields } from "../../schedule-fields";
import { updateScheduleAction } from "../../schedule-actions";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [schedule, employees] = await Promise.all([
    prisma.schedule.findFirst({ where: { id, employee: { organizationId } } }),
    prisma.employee.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),
  ]);

  if (!schedule) notFound();

  const t = await getTranslations("rh.escalas");
  const tf = await getTranslations("rh.escalas.fields");
  const tShift = await getTranslations("labels.scheduleShift");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getScheduleFields(tf, tShift)}
        action={updateScheduleAction.bind(null, id)}
        initialValues={schedule}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/ponto/escalas"
      />
    </div>
  );
}
