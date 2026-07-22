import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getTalhaoFields } from "../fields";
import { updateTalhaoAction } from "../actions";

export default async function EditTalhaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const talhao = await prisma.talhao.findFirst({ where: { id, organizationId } });
  if (!talhao) notFound();

  const t = await getTranslations("agricultura.talhoes");
  const tf = await getTranslations("agricultura.talhoes.fields");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getTalhaoFields(tf)}
        action={updateTalhaoAction.bind(null, id)}
        initialValues={talhao}
        backHref="/agricultura/talhoes"
      />
    </div>
  );
}
