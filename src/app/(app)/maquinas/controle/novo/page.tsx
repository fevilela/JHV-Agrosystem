import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { usageLogFields } from "../fields";
import { createUsageLogAction } from "../actions";

export default async function NewUsageLogPage() {
  const [machines, talhoes] = await Promise.all([
    prisma.machine.findMany({ orderBy: { type: "asc" } }),
    prisma.talhao.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Novo Registro de Uso</h1>
      <RecordForm
        fields={usageLogFields}
        action={createUsageLogAction}
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
