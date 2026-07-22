import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getMaintenanceFields } from "../fields";
import { createMaintenanceAction } from "../actions";

export default async function NewMaintenancePage() {
  const { organizationId } = await requireOrg();
  const machines = await prisma.machine.findMany({ where: { organizationId }, orderBy: { type: "asc" } });
  const t = await getTranslations("maquinas.manutencoes");
  const tType = await getTranslations("labels.maintenanceType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("new")}</h1>
      <RecordForm
        fields={getMaintenanceFields(t, tType)}
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
