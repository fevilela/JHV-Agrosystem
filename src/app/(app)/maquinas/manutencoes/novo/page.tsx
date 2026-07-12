import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { maintenanceFields } from "../fields";
import { createMaintenanceAction } from "../actions";

export default async function NewMaintenancePage() {
  const machines = await prisma.machine.findMany({ orderBy: { type: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Manutenção</h1>
      <RecordForm
        fields={maintenanceFields}
        action={createMaintenanceAction}
        relationOptions={{
          machineId: machines.map((m) => ({
            id: m.id,
            label: [m.brand, m.model, m.plateOrSerial].filter(Boolean).join(" ") || m.type,
          })),
        }}
        backHref="/maquinas/manutencoes"
      />
    </div>
  );
}
