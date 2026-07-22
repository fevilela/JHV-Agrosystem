import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getMachineFields } from "../fields";
import { updateMachineAction } from "../actions";

export default async function EditMachinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const machine = await prisma.machine.findFirst({ where: { id, organizationId } });
  if (!machine) notFound();

  const t = await getTranslations("maquinas.cadastro");
  const tType = await getTranslations("labels.machineType");
  const tStatus = await getTranslations("labels.machineStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getMachineFields(t, tType, tStatus)}
        action={updateMachineAction.bind(null, id)}
        initialValues={machine}
        backHref="/maquinas/cadastro"
      />
    </div>
  );
}
