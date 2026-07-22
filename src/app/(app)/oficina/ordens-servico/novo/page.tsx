import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getServiceOrderFields } from "../fields";
import { createServiceOrderAction } from "../actions";

export default async function NewServiceOrderPage() {
  const [machines, mechanics] = await Promise.all([
    prisma.machine.findMany({ orderBy: { type: "asc" } }),
    prisma.mechanic.findMany({ orderBy: { name: "asc" } }),
  ]);
  const t = await getTranslations("oficina.ordensServico");
  const tStatus = await getTranslations("labels.serviceOrderStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newDetail")}</h1>
      <RecordForm
        fields={getServiceOrderFields(t, tStatus)}
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
