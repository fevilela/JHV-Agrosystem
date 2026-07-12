import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { serviceOrderFields } from "../fields";
import { createServiceOrderAction } from "../actions";

export default async function NewServiceOrderPage() {
  const [machines, mechanics] = await Promise.all([
    prisma.machine.findMany({ orderBy: { type: "asc" } }),
    prisma.mechanic.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Ordem de Serviço</h1>
      <RecordForm
        fields={serviceOrderFields}
        action={createServiceOrderAction}
        initialValues={{ status: "ABERTA" }}
        relationOptions={{
          machineId: machines.map((m) => ({
            id: m.id,
            label: [m.brand, m.model, m.plateOrSerial].filter(Boolean).join(" ") || m.type,
          })),
          mechanicId: mechanics.map((m) => ({ id: m.id, label: m.name })),
        }}
        backHref="/oficina/ordens-servico"
      />
    </div>
  );
}
