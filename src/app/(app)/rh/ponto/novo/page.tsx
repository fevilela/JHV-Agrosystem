import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { attendanceFields } from "../fields";
import { createAttendanceAction } from "../actions";

export default async function NewAttendancePage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Ponto</h1>
      <RecordForm
        fields={attendanceFields}
        action={createAttendanceAction}
        initialValues={{ status: "PRESENTE" }}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/ponto"
      />
    </div>
  );
}
