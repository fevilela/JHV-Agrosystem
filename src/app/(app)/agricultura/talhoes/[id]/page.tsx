import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getTalhaoFields } from "../fields";
import { updateTalhaoAction } from "../actions";
import { TalhaoBoundarySection } from "./talhao-boundary-section";

export default async function EditTalhaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const talhao = await prisma.talhao.findFirst({ where: { id, organizationId } });
  if (!talhao) notFound();

  const properties = await prisma.property.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const t = await getTranslations("agricultura.talhoes");
  const tf = await getTranslations("agricultura.talhoes.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getTalhaoFields(tf)}
        action={updateTalhaoAction.bind(null, id)}
        initialValues={talhao}
        relationOptions={{
          propertyId: properties.map((p) => ({ id: p.id, label: p.name })),
        }}
        backHref="/agricultura/talhoes"
      />
      <div className="mt-6">
        <TalhaoBoundarySection talhaoId={id} boundary={talhao.boundary} />
      </div>
    </div>
  );
}
