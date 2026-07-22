import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getCostCenterFields } from "../fields";
import { updateCostCenterAction } from "../actions";

export default async function EditCostCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const center = await prisma.costCenter.findFirst({ where: { id, organizationId } });
  if (!center) notFound();

  const t = await getTranslations("financeiro.centroCustos");
  const tf = await getTranslations("financeiro.centroCustos.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getCostCenterFields(tf)}
        action={updateCostCenterAction.bind(null, id)}
        initialValues={center}
        backHref="/financeiro/centro-custos"
      />
    </div>
  );
}
