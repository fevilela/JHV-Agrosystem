import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getLoteFields } from "../../lote-fields";
import { updateLoteAction } from "../../lote-actions";

export default async function EditLotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrg();

  const lote = await prisma.lote.findFirst({ where: { id, organizationId } });
  if (!lote) notFound();

  const t = await getTranslations("pecuaria.lotes");
  const tf = await getTranslations("pecuaria.lotes.fields");
  const tCategory = await getTranslations("labels.livestockCategory");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getLoteFields(tf, tCategory)}
        action={updateLoteAction.bind(null, id)}
        initialValues={lote}
        backHref="/pecuaria/manejo/lotes"
      />
    </div>
  );
}
