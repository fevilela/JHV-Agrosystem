import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { usageLogFields } from "../fields";
import { updateUsageLogAction } from "../actions";

export default async function EditUsageLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [log, machines, talhoes] = await Promise.all([
    prisma.usageLog.findUnique({ where: { id } }),
    prisma.machine.findMany({ orderBy: { type: "asc" } }),
    prisma.talhao.findMany({ orderBy: { code: "asc" } }),
  ]);

  if (!log) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Editar Registro de Uso</h1>
      <RecordForm
        fields={usageLogFields}
        action={updateUsageLogAction.bind(null, id)}
        initialValues={log}
        relationOptions={{
          machineId: machines.map((m) => ({
            id: m.id,
            label: [m.brand, m.model, m.plateOrSerial].filter(Boolean).join(" ") || m.type,
          })),
          talhaoId: talhoes.map((t) => ({ id: t.id, label: t.code })),
        }}
        backHref="/maquinas/controle"
      />
    </div>
  );
}
