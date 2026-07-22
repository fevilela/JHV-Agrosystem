import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getUsageLogFields } from "../fields";
import { updateUsageLogAction } from "../actions";

export default async function EditUsageLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [log, machines, talhoes] = await Promise.all([
    prisma.usageLog.findFirst({ where: { id, machine: { organizationId } } }),
    prisma.machine.findMany({ where: { organizationId }, orderBy: { type: "asc" } }),
    prisma.talhao.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  if (!log) notFound();

  const t = await getTranslations("maquinas.controle");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getUsageLogFields(t)}
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
