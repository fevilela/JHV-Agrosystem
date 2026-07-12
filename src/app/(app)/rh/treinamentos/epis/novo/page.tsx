import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { epiFields } from "../../epi-fields";
import { createEpiAction } from "../../epi-actions";

export default async function NewEpiPage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Entrega de EPI</h1>
      <RecordForm
        fields={epiFields}
        action={createEpiAction}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos/epis"
      />
    </div>
  );
}
