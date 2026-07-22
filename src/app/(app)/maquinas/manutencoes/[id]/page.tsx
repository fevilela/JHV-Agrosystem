import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getMaintenanceFields } from "../fields";
import { updateMaintenanceAction } from "../actions";

export default async function EditMaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [maintenance, machines] = await Promise.all([
    prisma.maintenance.findFirst({ where: { id, machine: { organizationId } } }),
    prisma.machine.findMany({ where: { organizationId }, orderBy: { type: "asc" } }),
  ]);

  if (!maintenance) notFound();

  const t = await getTranslations("maquinas.manutencoes");
  const tType = await getTranslations("labels.maintenanceType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getMaintenanceFields(t, tType)}
        action={updateMaintenanceAction.bind(null, id)}
        initialValues={maintenance}
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
