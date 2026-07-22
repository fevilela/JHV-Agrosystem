import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getPlantioFields } from "../fields";
import { updatePlantioAction } from "../actions";

export default async function EditPlantioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [plantio, safras] = await Promise.all([
    prisma.plantio.findFirst({ where: { id, safra: { talhao: { organizationId } } } }),
    prisma.safra.findMany({ where: { talhao: { organizationId } }, orderBy: { name: "asc" }, include: { talhao: true } }),
  ]);

  if (!plantio) notFound();

  const t = await getTranslations("agricultura.plantio");
  const tf = await getTranslations("agricultura.plantio.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getPlantioFields(tf)}
        action={updatePlantioAction.bind(null, id)}
        initialValues={plantio}
        relationOptions={{
          safraId: safras.map((s) => ({ id: s.id, label: `${s.name} (${s.talhao.code})` })),
        }}
        backHref="/agricultura/plantio"
      />
    </div>
  );
}
