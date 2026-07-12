import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { trainingFields } from "../fields";
import { createTrainingAction } from "../actions";

export default async function NewTrainingPage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Treinamento</h1>
      <RecordForm
        fields={trainingFields}
        action={createTrainingAction}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/treinamentos"
      />
    </div>
  );
}
