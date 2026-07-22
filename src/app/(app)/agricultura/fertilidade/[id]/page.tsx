import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getFertilityFields } from "../fields";
import { updateFertilityAction } from "../actions";

export default async function EditFertilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const [record, talhoes] = await Promise.all([
    prisma.fertility.findFirst({ where: { id, talhao: { organizationId } } }),
    prisma.talhao.findMany({ where: { organizationId }, orderBy: { code: "asc" } }),
  ]);

  if (!record) notFound();

  const t = await getTranslations("agricultura.fertilidade");
  const tf = await getTranslations("agricultura.fertilidade.fields");
  const tType = await getTranslations("labels.fertilityType");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getFertilityFields(tf, tType)}
        action={updateFertilityAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          talhaoId: talhoes.map((t2) => ({ id: t2.id, label: t2.code })),
        }}
        backHref="/agricultura/fertilidade"
      />
    </div>
  );
}
