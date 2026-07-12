import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { machineFields } from "../fields";
import { updateMachineAction } from "../actions";

export default async function EditMachinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const machine = await prisma.machine.findUnique({ where: { id } });
  if (!machine) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Máquina</h1>
      <RecordForm
        fields={machineFields}
        action={updateMachineAction.bind(null, id)}
        initialValues={machine}
        backHref="/maquinas/cadastro"
      />
    </div>
  );
}
