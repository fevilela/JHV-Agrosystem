import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { scheduleFields } from "../../schedule-fields";
import { createScheduleAction } from "../../schedule-actions";

export default async function NewSchedulePage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Escala</h1>
      <RecordForm
        fields={scheduleFields}
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
