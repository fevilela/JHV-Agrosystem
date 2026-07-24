import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getPastureFields } from "../fields";
import { updatePastureAction } from "../actions";
import { PastureBoundarySection } from "./pasture-boundary-section";

export default async function EditPasturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const pasture = await prisma.pasture.findFirst({ where: { id, organizationId } });
  if (!pasture) notFound();

  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const t = await getTranslations("pecuaria.pastagens");
  const tf = await getTranslations("pecuaria.pastagens.fields");
  const tStatus = await getTranslations("labels.pastureRotationStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getPastureFields(tf, tStatus)}
        action={updatePastureAction.bind(null, id)}
        initialValues={pasture}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/pecuaria/pastagens"
      />
      <div className="mt-6">
        <PastureBoundarySection pastureId={id} boundary={pasture.boundary} />
      </div>
    </div>
  );
}
