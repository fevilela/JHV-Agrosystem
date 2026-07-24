import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getPastureFields } from "../fields";
import { createPastureAction } from "../actions";

export default async function NewPasturePage() {
  const { organizationId } = await requireOrg();
  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const t = await getTranslations("pecuaria.pastagens");
  const tf = await getTranslations("pecuaria.pastagens.fields");
  const tStatus = await getTranslations("labels.pastureRotationStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getPastureFields(tf, tStatus)}
        action={createPastureAction}
        initialValues={{ rotationStatus: "EM_USO" }}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/pecuaria/pastagens"
      />
    </div>
  );
}
