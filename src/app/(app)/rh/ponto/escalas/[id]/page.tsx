import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { scheduleFields } from "../../schedule-fields";
import { updateScheduleAction } from "../../schedule-actions";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [schedule, employees] = await Promise.all([
    prisma.schedule.findUnique({ where: { id } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!schedule) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Escala</h1>
      <RecordForm
        fields={scheduleFields}
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
