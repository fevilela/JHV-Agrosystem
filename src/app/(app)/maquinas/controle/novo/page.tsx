import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getUsageLogFields } from "../fields";
import { createUsageLogAction } from "../actions";

export default async function NewUsageLogPage() {
  const { organizationId } = await requireOrg();
  const [machines, talhoes] = await Promise.all([
    prisma.machine.findMany({ where: { organizationId }, orderBy: { type: "asc" } }),
    prisma.talhao.findMany({ orderBy: { code: "asc" } }),
  ]);
  const t = await getTranslations("maquinas.controle");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newDetail")}</h1>
      <RecordForm
        fields={getUsageLogFields(t)}
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
